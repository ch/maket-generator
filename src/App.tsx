import React, { useState, useRef, useEffect } from 'react';
import {
  SceneConfig,
  WidgetTransform,
  ExportResolution,
  CanvasRatio,
  CANVAS_RATIO_PRESETS,
  WidgetType,
  CardSlot,
} from './types';
import { MockupSceneSvg } from './components/MockupSceneSvg';
import { SidebarControls } from './components/SidebarControls';
import { AddWidgetModal } from './components/AddWidgetModal';
import { useHistoryState } from './hooks/useHistoryState';
import { getWidgetBaseDimensions } from './components/svg/PostCardSvg';
import {
  exportAsSvg,
  exportAsRasterImage,
  copyImageToClipboard,
  downloadBlob,
} from './utils/exportSvg';
import { DEMO_PHOTOS } from './data/demoContent';
import { optimizeImageFile } from './utils/imageOptimizer';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle,
  AlertCircle,
  Sun,
  LayoutTemplate,
  Undo2,
  Redo2,
  Plus,
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
  phoneIsLiked: true,
  cards: [
    {
      id: 'card-1',
      title: 'Верхня по центру',
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      isLiked: false,
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
  layerOrder: ['card-1', 'card-2', 'card-3', 'card-4', 'phone'],
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
  const {
    sceneConfig,
    setSceneConfig,
    commitSnapshot,
    phoneImage,
    setPhoneImage,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    historyTotal,
    isRestoredFromSave,
  } = useHistoryState(INITIAL_SCENE_CONFIG, null);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

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

  // Keyboard shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y or Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.altKey) {
        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
          e.preventDefault();
          if (canRedo) {
            redo();
            showToast('Повторено дію');
          }
        }
        // Undo: Ctrl+Z
        else if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (canUndo) {
            undo();
            showToast('Скасовано дію');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Warn user before leaving or reloading page if there are active edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (historyTotal > 1 || historyIndex > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [historyTotal, historyIndex]);

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

  const handleDropImage = async (slotId: string, file: File) => {
    try {
      const optimized = await optimizeImageFile(file);
      if (slotId === 'phone') {
        setPhoneImage(optimized);
        showToast('Фото телефону успішно оновлено! 📱');
      } else {
        handleUpdateCardImage(slotId, optimized);
        const card = sceneConfig.cards.find((c) => c.id === slotId);
        showToast(`Фото для «${card?.title || 'Віджет'}» оновлено! 📄`);
      }
    } catch (err) {
      console.error('Error handling dropped image:', err);
      showToast('Помилка обробки фотографії', 'error');
    }
  };

  const handleDropAvatar = async (file: File) => {
    try {
      const optimized = await optimizeImageFile(file, 600, 0.9);
      const nextConfig = {
        ...sceneConfig,
        profile: {
          ...sceneConfig.profile,
          avatarUrl: optimized,
        },
      };
      setSceneConfig(nextConfig);
      commitSnapshot(nextConfig, phoneImage, 'Оновлено аватар / логотип');
      showToast('Логотип / аватар успішно оновлено! ✨');
    } catch (err) {
      console.error('Error handling dropped avatar:', err);
      showToast('Помилка обробки логотипу', 'error');
    }
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

  const handleCanvasDragEnd = () => {
    commitSnapshot(sceneConfig, phoneImage, 'Переміщення / поворот віджета');
  };

  const handleToggleLike = (slotId: string) => {
    if (slotId === 'phone') {
      const nextLiked = sceneConfig.phoneIsLiked === false ? true : false;
      const nextConfig = {
        ...sceneConfig,
        phoneIsLiked: nextLiked,
      };
      setSceneConfig(nextConfig);
      commitSnapshot(
        nextConfig,
        phoneImage,
        nextLiked ? 'Сердечко телефону: Лайкнуто' : 'Сердечко телефону: Без лайка'
      );
      showToast(nextLiked ? 'Сердечко телефону: Лайкнуто ❤️' : 'Сердечко телефону: Без лайка 🤍');
    } else {
      const card = sceneConfig.cards.find((c) => c.id === slotId);
      if (!card) return;
      const nextLiked = !card.isLiked;
      const nextConfig = {
        ...sceneConfig,
        cards: sceneConfig.cards.map((c) => (c.id === slotId ? { ...c, isLiked: nextLiked } : c)),
      };
      setSceneConfig(nextConfig);
      commitSnapshot(
        nextConfig,
        phoneImage,
        nextLiked ? `Лайкнуто: ${card.title}` : `Без лайка: ${card.title}`
      );
      showToast(nextLiked ? `«${card.title}»: Лайкнуто ❤️` : `«${card.title}»: Без лайка 🤍`);
    }
  };

  const handleAddWidget = (title: string, widgetType: WidgetType) => {
    const newId = `widget-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const baseDims = getWidgetBaseDimensions(widgetType);

    const offsetIndex = sceneConfig.cards.length % 5;
    const spawnX = Math.round(sceneConfig.width / 2 - baseDims.width / 2 + (offsetIndex - 2) * 45);
    const spawnY = Math.round(sceneConfig.height / 2 - baseDims.height / 2 + (offsetIndex - 2) * 35);

    const defaultTitle =
      widgetType === 'phone'
        ? 'Смартфон (iPhone)'
        : widgetType === 'post'
        ? 'Instagram Пост'
        : widgetType === 'story'
        ? 'Stories 9:16'
        : widgetType === 'quote'
        ? 'Відгук клієнта'
        : 'Квадратне фото';

    const newCard: CardSlot = {
      id: newId,
      title: title.trim() || `${defaultTitle} #${sceneConfig.cards.length + 1}`,
      widgetType,
      imageUrl: null,
      placeholderText: 'PLACEHOLDER - INSERT YOUR DESIGN OR IMAGE',
      isLiked: widgetType === 'phone' ? true : false,
      customText:
        widgetType === 'quote'
          ? '«Неймовірна увага до деталей та бездоганний естетичний стиль бренду!»'
          : undefined,
      customAuthor: widgetType === 'quote' ? 'Олена Ковальчук' : undefined,
      transform: {
        x: Math.max(40, spawnX),
        y: Math.max(40, spawnY),
        scale: 1.0,
        rotation: 0,
      },
    };

    const currentLayerOrder =
      sceneConfig.layerOrder && sceneConfig.layerOrder.length > 0
        ? [...sceneConfig.layerOrder]
        : ['card-1', 'card-2', 'card-3', 'card-4', 'phone'];

    const nextConfig: SceneConfig = {
      ...sceneConfig,
      cards: [...sceneConfig.cards, newCard],
      layerOrder: [...currentLayerOrder.filter((id) => id !== newId), newId],
    };

    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, `Додано віджет: ${newCard.title}`);
    setSelectedSlotId(newId);
    showToast(`Віджет «${newCard.title}» додано!`);
  };

  const handleDeleteWidget = (slotId: string) => {
    if (slotId === 'phone') {
      showToast('Телефон є головним елементом макета і не видаляється', 'error');
      return;
    }
    const cardToDelete = sceneConfig.cards.find((c) => c.id === slotId);
    const cardTitle = cardToDelete?.title || 'Віджет';

    const nextConfig: SceneConfig = {
      ...sceneConfig,
      cards: sceneConfig.cards.filter((c) => c.id !== slotId),
      layerOrder: sceneConfig.layerOrder.filter((id) => id !== slotId),
    };

    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, `Видалено: ${cardTitle}`);
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
    showToast(`Віджет «${cardTitle}» видалено!`);
  };

  const handleUpdateCardImage = (cardId: string, url: string | null) => {
    const nextConfig = {
      ...sceneConfig,
      cards: sceneConfig.cards.map((c) => (c.id === cardId ? { ...c, imageUrl: url } : c)),
    };
    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, 'Оновлено зображення картки');
  };

  const handleResetTransforms = () => {
    const nextConfig: SceneConfig = {
      ...sceneConfig,
      phoneTransform: { ...INITIAL_SCENE_CONFIG.phoneTransform },
      cards: sceneConfig.cards.map((card, idx) => ({
        ...card,
        transform: INITIAL_SCENE_CONFIG.cards[idx]
          ? { ...INITIAL_SCENE_CONFIG.cards[idx].transform }
          : { ...card.transform, rotation: 0, scale: 1.0 },
      })),
      layerOrder: ['card-1', 'card-2', 'card-3', 'card-4', 'phone'].filter(
        (id) => id === 'phone' || sceneConfig.cards.some((c) => c.id === id)
      ),
    };
    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, 'Скидання трансформацій');
    showToast('Позиції та кути повернено до еталонних!');
  };

  const handleReorderLayer = (slotId: string, action: 'front' | 'back' | 'up' | 'down') => {
    const allSlotIds = ['phone', ...sceneConfig.cards.map((c) => c.id)];
    const currentOrder =
      sceneConfig.layerOrder && sceneConfig.layerOrder.length > 0
        ? [...sceneConfig.layerOrder]
        : allSlotIds;

    const index = currentOrder.indexOf(slotId);
    if (index === -1) return;

    const newOrder = [...currentOrder];
    if (action === 'front') {
      newOrder.splice(index, 1);
      newOrder.push(slotId);
    } else if (action === 'back') {
      newOrder.splice(index, 1);
      newOrder.unshift(slotId);
    } else if (action === 'up') {
      if (index < newOrder.length - 1) {
        const temp = newOrder[index];
        newOrder[index] = newOrder[index + 1];
        newOrder[index + 1] = temp;
      }
    } else if (action === 'down') {
      if (index > 0) {
        const temp = newOrder[index];
        newOrder[index] = newOrder[index - 1];
        newOrder[index - 1] = temp;
      }
    }

    const nextConfig: SceneConfig = {
      ...sceneConfig,
      layerOrder: newOrder,
    };
    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, 'Зміна порядку шарів');
  };

  const handleSetCanvasRatio = (ratio: CanvasRatio) => {
    const preset = CANVAS_RATIO_PRESETS[ratio];
    if (!preset) return;

    let phoneT = { ...sceneConfig.phoneTransform };
    let cardsT = sceneConfig.cards.map((c) => ({ ...c }));

    if (ratio === '1:1') {
      phoneT = { x: 180, y: 360, scale: 0.95, rotation: 0 };
      if (cardsT[0]) cardsT[0].transform = { x: 550, y: 310, scale: 0.95, rotation: 0 };
      if (cardsT[1]) cardsT[1].transform = { x: 1040, y: 300, scale: 0.95, rotation: 0 };
      if (cardsT[2]) cardsT[2].transform = { x: 720, y: 560, scale: 0.95, rotation: -7 };
      if (cardsT[3]) cardsT[3].transform = { x: 940, y: 640, scale: 0.95, rotation: 5 };
    } else if (ratio === '4:5') {
      phoneT = { x: 110, y: 410, scale: 0.9, rotation: 0 };
      if (cardsT[0]) cardsT[0].transform = { x: 470, y: 360, scale: 0.9, rotation: 0 };
      if (cardsT[1]) cardsT[1].transform = { x: 890, y: 350, scale: 0.9, rotation: 0 };
      if (cardsT[2]) cardsT[2].transform = { x: 620, y: 610, scale: 0.9, rotation: -7 };
      if (cardsT[3]) cardsT[3].transform = { x: 810, y: 700, scale: 0.9, rotation: 5 };
    } else if (ratio === '5:4') {
      phoneT = { x: 200, y: 250, scale: 1.0, rotation: 0 };
      if (cardsT[0]) cardsT[0].transform = { x: 580, y: 210, scale: 1.0, rotation: 0 };
      if (cardsT[1]) cardsT[1].transform = { x: 1100, y: 200, scale: 1.0, rotation: 0 };
      if (cardsT[2]) cardsT[2].transform = { x: 750, y: 460, scale: 1.0, rotation: -7 };
      if (cardsT[3]) cardsT[3].transform = { x: 970, y: 540, scale: 1.0, rotation: 5 };
    } else if (ratio === '16:9') {
      phoneT = { x: 220, y: 105, scale: 0.95, rotation: 0 };
      if (cardsT[0]) cardsT[0].transform = { x: 600, y: 80, scale: 0.95, rotation: 0 };
      if (cardsT[1]) cardsT[1].transform = { x: 1140, y: 75, scale: 0.95, rotation: 0 };
      if (cardsT[2]) cardsT[2].transform = { x: 770, y: 320, scale: 0.95, rotation: -7 };
      if (cardsT[3]) cardsT[3].transform = { x: 990, y: 390, scale: 0.95, rotation: 5 };
    } else if (ratio === '9:16') {
      phoneT = { x: 370, y: 190, scale: 0.95, rotation: 0 };
      if (cardsT[0]) cardsT[0].transform = { x: 130, y: 920, scale: 0.88, rotation: -3 };
      if (cardsT[1]) cardsT[1].transform = { x: 610, y: 920, scale: 0.88, rotation: 3 };
      if (cardsT[2]) cardsT[2].transform = { x: 190, y: 1300, scale: 0.88, rotation: -6 };
      if (cardsT[3]) cardsT[3].transform = { x: 570, y: 1330, scale: 0.88, rotation: 5 };
    } else {
      phoneT = { ...INITIAL_SCENE_CONFIG.phoneTransform };
      if (cardsT[0]) cardsT[0].transform = { ...INITIAL_SCENE_CONFIG.cards[0].transform };
      if (cardsT[1]) cardsT[1].transform = { ...INITIAL_SCENE_CONFIG.cards[1].transform };
      if (cardsT[2]) cardsT[2].transform = { ...INITIAL_SCENE_CONFIG.cards[2].transform };
      if (cardsT[3]) cardsT[3].transform = { ...INITIAL_SCENE_CONFIG.cards[3].transform };
    }

    const nextConfig: SceneConfig = {
      ...sceneConfig,
      canvasRatio: ratio,
      width: preset.width,
      height: preset.height,
      phoneTransform: phoneT,
      cards: cardsT,
    };

    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, phoneImage, `Зміна формату: ${preset.ratioDisplay}`);
    showToast(`Холст змінено на ${preset.ratioDisplay} (${preset.width}×${preset.height} px)`);
  };

  const handleLoadDemoImages = () => {
    const newPhoneImg = DEMO_PHOTOS.phone;
    const nextConfig: SceneConfig = {
      ...sceneConfig,
      profile: {
        ...sceneConfig.profile,
        avatarUrl: DEMO_PHOTOS.avatar,
      },
      cards: sceneConfig.cards.map((card, idx) => {
        const photoKey = `card${(idx % 4) + 1}` as keyof typeof DEMO_PHOTOS;
        return {
          ...card,
          imageUrl: DEMO_PHOTOS[photoKey] || null,
        };
      }),
    };
    setPhoneImage(newPhoneImg);
    setSceneConfig(nextConfig);
    commitSnapshot(nextConfig, newPhoneImg, 'Завантажено демонстраційні фото');
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
        <header className="h-14 border-b border-neutral-800/80 bg-neutral-900/70 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-10 shrink-0 gap-2">
          {/* Left: Format & Sun Badges */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              SVG Vector
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5 bg-neutral-800/60 px-2.5 py-1 rounded-lg border border-neutral-700/50">
              <LayoutTemplate size={13} className="text-neutral-500" />
              <strong className="text-neutral-300">
                {CANVAS_RATIO_PRESETS[sceneConfig.canvasRatio]?.ratioDisplay || 'Custom'}
              </strong>{' '}
              <span className="text-neutral-500 hidden md:inline">
                ({sceneConfig.width} × {sceneConfig.height} px)
              </span>
            </span>
            {sceneConfig.shadowEnabled && (
              <span className="text-xs text-amber-400/90 hidden lg:flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Sun size={12} />
                <span>Сонце: {sceneConfig.lightAngle}°</span>
              </span>
            )}
          </div>

          {/* Center: History Undo/Redo & Auto-save Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1.5 rounded transition flex items-center gap-1 ${
                  canUndo
                    ? 'text-neutral-200 hover:text-white hover:bg-neutral-700/70 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed opacity-40'
                }`}
                title="Скасувати (Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <div className="w-[1px] h-3.5 bg-neutral-700 mx-0.5" />
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1.5 rounded transition flex items-center gap-1 ${
                  canRedo
                    ? 'text-neutral-200 hover:text-white hover:bg-neutral-700/70 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed opacity-40'
                }`}
                title="Повторити (Ctrl+Y або Ctrl+Shift+Z)"
              >
                <Redo2 size={15} />
              </button>
            </div>

            {/* Step Counter Badge */}
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800/60 px-2 py-1 rounded border border-neutral-700/40 hidden sm:inline-block">
              Крок {historyIndex + 1}/{historyTotal}
            </span>

            {/* Auto-saved Live Indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
              title="Історія та фотографії автоматично зберігаються в IndexedDB (без обмеження 5 МБ)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isRestoredFromSave ? 'Збережено в IndexedDB' : 'Автозбережено'}</span>
            </div>
          </div>

          {/* Right: + Add Widget & Zoom controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddWidgetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition active:scale-95"
              title="Додати новий віджет (Instagram пост, Stories, відгук, фото)"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Віджет</span>
            </button>

            {/* Quick Zoom & Reset controls */}
            <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60 transition"
                title="Зменшити"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono px-1 text-neutral-300 min-w-[36px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60 transition"
                title="Збільшити"
              >
                <ZoomIn size={14} />
              </button>
              <div className="w-[1px] h-3.5 bg-neutral-700 mx-0.5 hidden sm:block" />
              <button
                onClick={() => setZoomLevel(1)}
                className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition font-medium"
                title="Масштабувати на весь екран (100% Fit)"
              >
                <Maximize size={12} className="text-indigo-400" />
                <span>100% Fit</span>
              </button>
            </div>
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
              onDragEnd={handleCanvasDragEnd}
              onToggleLike={handleToggleLike}
              onSelectSlot={setSelectedSlotId}
              onDropImage={handleDropImage}
              onDropAvatar={handleDropAvatar}
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
          onReorderLayer={handleReorderLayer}
          onOpenAddWidgetModal={() => setIsAddWidgetModalOpen(true)}
          onDeleteWidget={handleDeleteWidget}
          onExport={handleExport}
          onCopyClipboard={handleCopyClipboard}
          onLoadDemoImages={handleLoadDemoImages}
          onResetTransforms={handleResetTransforms}
          onSetCanvasRatio={handleSetCanvasRatio}
          onShowToast={showToast}
        />
      </aside>

      {/* Modal Dialog for Adding New Widgets */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
