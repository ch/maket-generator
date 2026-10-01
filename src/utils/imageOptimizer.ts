/**
 * Utility for client-side image compression and resizing.
 * Prevents memory bloating and huge base64 strings when users drop 15MB+ camera photos.
 */

const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.88;

/**
 * Optimizes an image File or Blob by resizing it to a maximum dimension
 * and compressing it to WebP (or JPEG fallback) at high visual quality.
 */
export async function optimizeImageFile(
  file: File | Blob,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY
): Promise<string> {
  // If the file is SVG, preserve it as text/svg Data URL directly to keep vector sharpness
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Load image
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return optimizeDataUrl(dataUrl, maxDimension, quality, file.type);
}

/**
 * Takes a base64 Data URL, resizes to maxDimension and compresses.
 */
export async function optimizeDataUrl(
  dataUrl: string,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
  originalMimeType = 'image/jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Check if resizing is needed
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If original is PNG with transparency, keep PNG format if alpha is present, else WebP
      const isPng = originalMimeType.includes('png');
      const targetMime = isPng ? 'image/png' : 'image/webp';

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const optimizedUrl = canvas.toDataURL(targetMime, isPng ? undefined : quality);
        // If resulting url is actually bigger than original (rare for small icons), keep original
        if (dataUrl.length > 500 && optimizedUrl.length > dataUrl.length && isPng) {
          resolve(dataUrl);
        } else {
          resolve(optimizedUrl);
        }
      } catch {
        // Fallback to JPEG if browser doesn't support targetMime
        try {
          const fallbackUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(fallbackUrl);
        } catch {
          resolve(dataUrl);
        }
      }
    };

    img.onerror = () => {
      // If image loading fails, return raw dataUrl as fallback
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
