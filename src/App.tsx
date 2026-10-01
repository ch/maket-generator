import React, { useState, useRef, useEffect } from 'react';
import {
  SceneConfig,
  WidgetTransform,
  ExportResolution,
  CanvasRatio,
} from './types';
import { MockupSceneSvg } from './components/MockupSceneSvg';
import { SidebarControls, CANVAS_RATIO_PRESETS } from './components/SidebarControls';
import {
  exportAsSvg,
  exportAsRasterImage,
  copyImageToClipboard,
  downloadBlob,
} from './utils/exportSvg';
import { DEMO_PHOTOS } from './data/demoContent';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle,
  AlertCircle,
  Sun,
  LayoutTemplate,
} from 'lucide-react';

const INITIAL_SCENE_CONFIG: SceneConfig = {
  width: 1600,
  height: 1100,
  canvasRatio: 'reference',
  backgroundType: 'color',
  backgroundColor: '#E5E6E8', // Exact studio gray from reference photo
  backgroundColor2: '#D6D8DC',
  gradientAngle: 135,
  shadowEnabled: true,
  lightAngle: 315, // 315° = natural top-left studio sun, casting shadow down-right
  shadowDistance: 26,
  shadowIntensity: 1.0,
  shadowSoftness: 28,
  phoneTransform: {
    x: 230,
    y: 200,
    scale: 1.0,
    rotation: 0,
  },
  cards: [
    {
      id: 'card-1',
      title: 'Верхня по центру',
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      transform: {
        x: 620,
        y: 160,
        scale: 1.0,
        rotation: 0,
      },
    },
    {
      id: 'card-2',
      title: 'Верхня праворуч',
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      transform: {
        x: 1180,
        y: 155,
        scale: 1.0,
        rotation: 0,
      },
    },
    {
      id: 'card-3',
      title: 'Середня нахилена',
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      transform: {
        x: 800,
        y: 410,
        scale: 1.0,
        rotation: -7, // tilted counter-clockwise like reference
      },
    },
    {
      id: 'card-4',
      title: 'Нижня праворуч',
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      transform: {
        x: 1030,
        y: 490,
        scale: 1.0,
        rotation: 5, // tilted clockwise like reference
      },
    },
  ],
  profile: {
    username: '@subtleflowco',
    avatarUrl: null,
    avatarMonogram: 'S',
    avatarBgColor: '#6A7B69',
    headerTitle: 'Social Media',
    likesCount: '726 likes',
    caption: 'subtleflowco Instagram is a popular photo and video sharing social networking service owned by Meta',
  },
};

export default function App() {
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(INITIAL_SCENE_CONFIG);
  const [phoneImage, setPhoneImage] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Dynamic viewport tracking to scale canvas to 100% of the available screen immediately
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (!viewportRef.current) return;
    const updateSize = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        setViewportSize({
          width: Math.max(200, rect.width),
          height: Math.max(200, rect.height),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(viewportRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute 100% full-screen fit size for canvas
  const padding = 20; // 20px padding from screen edges
  const availW = Math.max(100, viewportSize.width - padding * 2);
  const availH = Math.max(100, viewportSize.height - padding * 2);
  const availAspect = availW / availH;
  const canvasAspect = sceneConfig.width / sceneConfig.height;

  let fitWidth = availW;
  let fitHeight = availH;
  if (canvasAspect > availAspect) {
    fitWidth = availW;
    fitHeight = availW / canvasAspect;
  } else {
    fitHeight = availH;
    fitWidth = availH * canvasAspect;
  }
  const canvasFitSize = { width: fitWidth, height: fitHeight };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateTransform = (slotId: string, transform: WidgetTransform) => {
    if (slotId === 'phone') {
      setSceneConfig((prev) => ({
        ...prev,
        phoneTransform: transform,
      }));
    } else {
      setSceneConfig((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === slotId ? { ...c, transform } : c)),
      }));
    }
  };

  const handleUpdateCardImage = (cardId: string, url: string | null) => {
    setSceneConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, imageUrl: url } : c)),
    }));
  };

  const handleResetTransforms = () => {
    setSceneConfig((prev) => ({
      ...prev,
      phoneTransform: { ...INITIAL_SCENE_CONFIG.phoneTransform },
      cards: prev.cards.map((card, idx) => ({
        ...card,
        transform: { ...INITIAL_SCENE_CONFIG.cards[idx].transform },
      })),
    }));
    showToast('Позиції та кути повернено до еталонних!');
  };

  const handleSetCanvasRatio = (ratio: CanvasRatio) => {
    const preset = CANVAS_RATIO_PRESETS[ratio];
    if (!preset) return;

    setSceneConfig((prev) => {
      // Calculate responsive layout adaptation based on ratio
      let phoneT = { ...prev.phoneTransform };
      let c1T = { ...prev.cards[0].transform };
      let c2T = { ...prev.cards[1].transform };
      let c3T = { ...prev.cards[2].transform };
      let c4T = { ...prev.cards[3].transform };

      if (ratio === '1:1') {
        phoneT = { x: 180, y: 360, scale: 0.95, rotation: 0 };
        c1T = { x: 550, y: 310, scale: 0.95, rotation: 0 };
        c2T = { x: 1040, y: 300, scale: 0.95, rotation: 0 };
        c3T = { x: 720, y: 560, scale: 0.95, rotation: -7 };
        c4T = { x: 940, y: 640, scale: 0.95, rotation: 5 };
      } else if (ratio === '4:5') {
        phoneT = { x: 110, y: 410, scale: 0.9, rotation: 0 };
        c1T = { x: 470, y: 360, scale: 0.9, rotation: 0 };
        c2T = { x: 890, y: 350, scale: 0.9, rotation: 0 };
        c3T = { x: 620, y: 610, scale: 0.9, rotation: -7 };
        c4T = { x: 810, y: 700, scale: 0.9, rotation: 5 };
      } else if (ratio === '5:4') {
        phoneT = { x: 200, y: 250, scale: 1.0, rotation: 0 };
        c1T = { x: 580, y: 210, scale: 1.0, rotation: 0 };
        c2T = { x: 1100, y: 200, scale: 1.0, rotation: 0 };
        c3T = { x: 750, y: 460, scale: 1.0, rotation: -7 };
        c4T = { x: 970, y: 540, scale: 1.0, rotation: 5 };
      } else if (ratio === '16:9') {
        phoneT = { x: 220, y: 105, scale: 0.95, rotation: 0 };
        c1T = { x: 600, y: 80, scale: 0.95, rotation: 0 };
        c2T = { x: 1140, y: 75, scale: 0.95, rotation: 0 };
        c3T = { x: 770, y: 320, scale: 0.95, rotation: -7 };
        c4T = { x: 990, y: 390, scale: 0.95, rotation: 5 };
      } else if (ratio === '9:16') {
        phoneT = { x: 370, y: 190, scale: 0.95, rotation: 0 };
        c1T = { x: 130, y: 920, scale: 0.88, rotation: -3 };
        c2T = { x: 610, y: 920, scale: 0.88, rotation: 3 };
        c3T = { x: 190, y: 1300, scale: 0.88, rotation: -6 };
        c4T = { x: 570, y: 1330, scale: 0.88, rotation: 5 };
      } else {
        // reference 1600x1100
        phoneT = { ...INITIAL_SCENE_CONFIG.phoneTransform };
        c1T = { ...INITIAL_SCENE_CONFIG.cards[0].transform };
        c2T = { ...INITIAL_SCENE_CONFIG.cards[1].transform };
        c3T = { ...INITIAL_SCENE_CONFIG.cards[2].transform };
        c4T = { ...INITIAL_SCENE_CONFIG.cards[3].transform };
      }

      return {
        ...prev,
        canvasRatio: ratio,
        width: preset.width,
        height: preset.height,
        phoneTransform: phoneT,
        cards: [
          { ...prev.cards[0], transform: c1T },
          { ...prev.cards[1], transform: c2T },
          { ...prev.cards[2], transform: c3T },
          { ...prev.cards[3], transform: c4T },
        ],
      };
    });

    showToast(`Холст змінено на ${preset.ratioDisplay} (${preset.width}×${preset.height} px)`);
  };

  const handleLoadDemoImages = () => {
    setPhoneImage(DEMO_PHOTOS.phone);
    setSceneConfig((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatarUrl: DEMO_PHOTOS.avatar,
      },
      cards: prev.cards.map((card, idx) => {
        const photoKey = `card${idx + 1}` as keyof typeof DEMO_PHOTOS;
        return {
          ...card,
          imageUrl: DEMO_PHOTOS[photoKey] || null,
        };
      }),
    }));
    showToast('Завантажено зразки стильних фотографій!');
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'svg', resolution: ExportResolution) => {
    if (!svgRef.current) return;
    setIsExporting(true);

    try {
      if (format === 'svg') {
        exportAsSvg(svgRef.current, `mockup-${sceneConfig.canvasRatio}-${Date.now()}.svg`);
        showToast('Векторний SVG успішно завантажено!');
      } else {
        const blob = await exportAsRasterImage(
          svgRef.current,
          format,
          resolution,
          0.96,
          `mockup-${sceneConfig.canvasRatio}-${resolution}x-${Date.now()}.${format}`
        );
        downloadBlob(blob, `mockup-${sceneConfig.canvasRatio}-${resolution}x-${Date.now()}.${format}`);
        showToast(`Зображення ${format.toUpperCase()} (${resolution}x) завантажено!`);
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Помилка під час експорту', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async (resolution: ExportResolution) => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      const success = await copyImageToClipboard(svgRef.current, resolution);
      if (success) {
        showToast('Зображення скопійовано в буфер обміну!');
      } else {
        showToast('Не вдалося скопіювати в буфер', 'error');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      showToast('Помилка копіювання в буфер', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-neutral-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Floating App Bar */}
        <header className="h-14 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              SVG Vector Mode
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <LayoutTemplate size={13} className="text-neutral-500" />
              <strong className="text-neutral-300">
                {CANVAS_RATIO_PRESETS[sceneConfig.canvasRatio]?.ratioDisplay || 'Custom'}
              </strong>{' '}
              ({sceneConfig.width} × {sceneConfig.height} px)
            </span>
            {sceneConfig.shadowEnabled && (
              <span className="text-xs text-amber-400/90 hidden md:flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Sun size={12} />
                <span>Сонце: {sceneConfig.lightAngle}°</span>
              </span>
            )}
          </div>

          {/* Quick Zoom & Reset controls */}
          <div className="flex items-center gap-1.5 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60 transition"
              title="Зменшити"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs font-mono px-1.5 text-neutral-300 min-w-[42px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60 transition"
              title="Збільшити"
            >
              <ZoomIn size={15} />
            </button>
            <div className="w-[1px] h-4 bg-neutral-700 mx-1" />
            <button
              onClick={() => setZoomLevel(1)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition font-medium"
              title="Масштабувати на весь екран (100% Fit)"
            >
              <Maximize size={13} className="text-indigo-400" />
              <span>На весь екран</span>
            </button>
          </div>
        </header>

        {/* Canvas Display Viewport - Fills 100% of Screen Immediately */}
        <main
          ref={viewportRef}
          className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-[#121316] relative select-none"
        >
          {/* Subtle Workspace Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Scalable Container for SVG Scene (Expanded to 100% Available Screen) */}
          <div
            className="transition-transform duration-100 ease-out origin-center flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-neutral-800/80 shrink-0"
            style={{
              width: `${Math.round(canvasFitSize.width * zoomLevel)}px`,
              height: `${Math.round(canvasFitSize.height * zoomLevel)}px`,
              maxWidth: zoomLevel <= 1 ? '100%' : undefined,
              maxHeight: zoomLevel <= 1 ? '100%' : undefined,
            }}
          >
            <MockupSceneSvg
              svgRef={svgRef}
              sceneConfig={sceneConfig}
              onUpdateTransform={handleUpdateTransform}
              onSelectSlot={setSelectedSlotId}
              selectedSlotId={selectedSlotId}
              phoneImage={phoneImage}
            />
          </div>

          {/* Export loading overlay */}
          {isExporting && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white gap-3">
              <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Рендеринг зображення високої чіткості...</p>
            </div>
          )}
        </main>
      </div>

      {/* Right Sidebar Controls */}
      <aside className="h-[48vh] lg:h-full shrink-0 border-t lg:border-t-0 z-20">
        <SidebarControls
          sceneConfig={sceneConfig}
          onChangeSceneConfig={setSceneConfig}
          phoneImage={phoneImage}
          onUpdatePhoneImage={setPhoneImage}
          onUpdateCardImage={handleUpdateCardImage}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
          onExport={handleExport}
          onCopyClipboard={handleCopyClipboard}
          onLoadDemoImages={handleLoadDemoImages}
          onResetTransforms={handleResetTransforms}
          onSetCanvasRatio={handleSetCanvasRatio}
          onShowToast={showToast}
        />
      </aside>
    </div>
  );
}
