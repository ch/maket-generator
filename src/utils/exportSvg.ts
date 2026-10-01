import { ExportFormat, ExportResolution } from '../types';

/**
 * Downloads a Blob with a specific filename
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Serializes the SVG DOM element into a clean standalone SVG string
 */
export const serializeSvg = (svgElement: SVGSVGElement): string => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Ensure xmlns is set
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Inject font definitions if needed so external SVG renderers display system fonts smoothly
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
};

/**
 * Exports the scene as a native vector SVG file
 */
export const exportAsSvg = (svgElement: SVGSVGElement, filename = 'mockup-scene.svg') => {
  const svgString = serializeSvg(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
};

/**
 * Renders the SVG to high-resolution raster (PNG or JPEG) via an off-screen HTML5 Canvas
 */
export const exportAsRasterImage = async (
  svgElement: SVGSVGElement,
  format: 'png' | 'jpeg' = 'png',
  resolutionScale: ExportResolution = 2,
  quality = 0.95,
  filename = `mockup-scene.${format}`
): Promise<Blob> => {
  const svgString = serializeSvg(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const viewBox = svgElement.viewBox.baseVal;
  const originalWidth = viewBox.width || svgElement.clientWidth || 1600;
  const originalHeight = viewBox.height || svgElement.clientHeight || 1100;

  const targetWidth = Math.round(originalWidth * resolutionScale);
  const targetHeight = Math.round(originalHeight * resolutionScale);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If JPEG, fill background white first
      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
};

/**
 * Copies the rendered PNG directly to system clipboard
 */
export const copyImageToClipboard = async (
  svgElement: SVGSVGElement,
  resolutionScale: ExportResolution = 2
): Promise<boolean> => {
  try {
    const blob = await exportAsRasterImage(svgElement, 'png', resolutionScale);
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
};
