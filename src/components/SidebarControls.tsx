import React, { useState, useRef, useEffect } from 'react';
import {
  SceneConfig,
  WidgetTransform,
  ExportResolution,
  CanvasRatio,
  CANVAS_RATIO_PRESETS,
} from '../types';
import { SunAngleKnob } from './SunAngleKnob';
import { WidgetRotationDial } from './WidgetRotationDial';
import { PHONE_BASE_WIDTH, PHONE_BASE_HEIGHT } from './svg/PhoneSvg';
import { CARD_BASE_WIDTH, CARD_BASE_HEIGHT, getWidgetBaseDimensions } from './svg/PostCardSvg';
import {
  Layers,
  Sliders,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Maximize2,
  UploadCloud,
  FileCode,
  Palette,
  RotateCw,
  Sun,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  Bookmark,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Lock,
  Box,
  Move,
  ArrowLeft,
  ArrowRight,
  Eye,
  Trash2,
  Plus,
  Quote,
  Heart,
} from 'lucide-react';
import { PresetsTab } from './PresetsTab';
import { HexColorPickerInput } from './HexColorPickerInput';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface SidebarControlsProps {
  sceneConfig: SceneConfig;
  onChangeSceneConfig: React.Dispatch<React.SetStateAction<SceneConfig>>;
  phoneImage: string | null;
  onUpdatePhoneImage: (url: string | null) => void;
  onUpdateCardImage: (cardId: string, url: string | null) => void;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  onReorderLayer: (slotId: string, action: 'front' | 'back' | 'up' | 'down') => void;
  onOpenAddWidgetModal: () => void;
  onDeleteWidget: (slotId: string) => void;
  onExport: (format: 'png' | 'jpeg' | 'svg', resolution: ExportResolution) => void;
  onCopyClipboard: (resolution: ExportResolution) => void;
  onLoadDemoImages: () => void;
  onResetTransforms: () => void;
  onSetCanvasRatio: (ratio: CanvasRatio) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  sceneConfig,
  onChangeSceneConfig,
  phoneImage,
  onUpdatePhoneImage,
  onUpdateCardImage,
  selectedSlotId,
  onSelectSlot,
  onReorderLayer,
  onOpenAddWidgetModal,
  onDeleteWidget,
  onExport,
  onCopyClipboard,
  onLoadDemoImages,
  onResetTransforms,
  onSetCanvasRatio,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'canvas' | 'shadows' | 'widget' | 'transform' | 'presets' | 'export'>('canvas');
  const [exportRes, setExportRes] = useState<ExportResolution>(2);
  const [copied, setCopied] = useState(false);

  // When user selects/clicks any widget on canvas, automatically switch to 'widget' tab
  const prevSelectedSlotRef = useRef<string | null>(selectedSlotId);
  useEffect(() => {
    if (selectedSlotId && selectedSlotId !== prevSelectedSlotRef.current) {
      setActiveTab('widget');
    }
    prevSelectedSlotRef.current = selectedSlotId;
  }, [selectedSlotId]);

  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const { profile, phoneTransform, cards, shadowEnabled, lightAngle, shadowDistance, shadowIntensity, shadowSoftness } = sceneConfig;

  // Selected item transform helper
  const isPhoneSelected = selectedSlotId === 'phone';
  const selectedCard = cards.find((c) => c.id === selectedSlotId);
  const selectedTransform: WidgetTransform | null = isPhoneSelected
    ? phoneTransform
    : selectedCard
    ? selectedCard.transform
    : null;

  const handleUpdateSelectedTransform = (updates: Partial<WidgetTransform>) => {
    if (isPhoneSelected) {
      onChangeSceneConfig((prev) => ({
        ...prev,
        phoneTransform: { ...prev.phoneTransform, ...updates },
      }));
    } else if (selectedCard) {
      onChangeSceneConfig((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === selectedCard.id ? { ...c, transform: { ...c.transform, ...updates } } : c
        ),
      }));
    }
  };

  // Master card scale (scales all 4 cards simultaneously, strictly preserving 100% aspect ratio)
  const handleMasterCardScale = (scaleValue: number) => {
    onChangeSceneConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => ({
        ...c,
        transform: {
          ...c.transform,
          scale: scaleValue,
        },
      })),
    }));
  };

  const [isAvatarBoxDragOver, setIsAvatarBoxDragOver] = useState(false);

  // Batch image upload
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 5);
    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];
      try {
        const result = await optimizeImageFile(file);
        if (index === 0) {
          onUpdatePhoneImage(result);
        } else {
          const cardId = `card-${index}`;
          onUpdateCardImage(cardId, result);
        }
      } catch (err) {
        console.error('Batch upload error:', err);
      }
    }

    if (batchFileInputRef.current) {
      batchFileInputRef.current.value = '';
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await optimizeImageFile(file, 600, 0.9);
      onChangeSceneConfig((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: result },
      }));
    } catch (err) {
      console.error('Avatar upload error:', err);
    }
  };

  // Direct avatar drop handler for sidebar avatar box
  const handleAvatarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarBoxDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      try {
        const result = await optimizeImageFile(files[0], 600, 0.9);
        onChangeSceneConfig((prev) => ({
          ...prev,
          profile: { ...prev.profile, avatarUrl: result },
        }));
        onShowToast('Аватар успішно оновлено!');
      } catch (err) {
        console.error('Avatar drop error:', err);
        onShowToast('Помилка завантаження фото', 'error');
      }
    }
  };

  const handleCopy = () => {
    onCopyClipboard(exportRes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 text-neutral-200 w-full sm:w-[390px] lg:w-[430px] select-none shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles size={17} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Mockup Generator</h1>
            <p className="text-[11px] text-neutral-400">Pure SVG • 360° Studio Light</p>
          </div>
        </div>

        {/* Demo button */}
        <button
          onClick={onLoadDemoImages}
          title="Завантажити зразки фото"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg transition border border-neutral-700/60"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Демо фото</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-neutral-800 px-2 pt-2 gap-0.5 bg-neutral-900 overflow-x-auto">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'canvas'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LayoutTemplate size={13} />
          Холст
        </button>
        <button
          onClick={() => setActiveTab('widget')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'widget'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : selectedSlotId
              ? 'border-transparent text-indigo-300 hover:text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          title="Налаштування вибраного віджета (розміри px, шар, поворот 360°)"
        >
          <Box size={13} className={selectedSlotId ? 'text-indigo-400' : ''} />
          <span>Віджет</span>
          {selectedSlotId && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('shadows')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'shadows'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sun size={13} className="text-amber-400" />
          Тіні 360°
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'content'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ImageIcon size={13} />
          Фото
        </button>
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'transform'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Maximize2 size={13} />
          Масштаб
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'presets'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bookmark size={13} />
          Пресети
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === 'export'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Download size={13} />
          Експорт
        </button>
      </div>

      {/* Main Tab Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-sm">
        {/* ================= TAB: CANVAS & BACKGROUND ================= */}
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            {/* Aspect Ratio Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <LayoutTemplate size={13} />
                  Пропорції холста
                </h3>
                <span className="text-[11px] font-mono text-indigo-400">
                  {sceneConfig.width} × {sceneConfig.height} px
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CANVAS_RATIO_PRESETS) as CanvasRatio[]).map((key) => {
                  const item = CANVAS_RATIO_PRESETS[key];
                  const isSelected = sceneConfig.canvasRatio === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onSetCanvasRatio(key)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50'
                          : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <span className="font-bold text-xs">{item.ratioDisplay}</span>
                      <span className="text-[10px] mt-0.5 text-neutral-400 line-clamp-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Pixel Dimensions Inputs */}
            <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Sliders size={13} className="text-indigo-400" />
                  Розміри холста в пікселях
                </span>
                <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                  {(sceneConfig.width / sceneConfig.height).toFixed(2)}:1
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 items-center">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Ширина (Width px)</label>
                  <input
                    type="number"
                    min={400}
                    max={8000}
                    step={10}
                    value={sceneConfig.width}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val && val > 0) {
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          width: val,
                          canvasRatio: 'custom',
                        }));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="1600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Висота (Height px)</label>
                  <input
                    type="number"
                    min={400}
                    max={8000}
                    step={10}
                    value={sceneConfig.height}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val && val > 0) {
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          height: val,
                          canvasRatio: 'custom',
                        }));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="1100"
                  />
                </div>
              </div>

              {/* Quick resolution presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-neutral-400 block">Швидкі пресети роздільної здатності:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { w: 1080, h: 1080, label: '1080×1080 (1:1)' },
                    { w: 1080, h: 1350, label: '1080×1350 (4:5)' },
                    { w: 1080, h: 1920, label: '1080×1920 (9:16)' },
                    { w: 1600, h: 1100, label: '1600×1100 (Еталон)' },
                    { w: 1920, h: 1080, label: '1920×1080 (FHD)' },
                    { w: 2560, h: 1440, label: '2560×1440 (2K)' },
                    { w: 3840, h: 2160, label: '3840×2160 (4K)' },
                  ].map((res) => (
                    <button
                      key={res.label}
                      onClick={() => {
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          width: res.w,
                          height: res.h,
                          canvasRatio: 'custom',
                        }));
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition font-mono ${
                        sceneConfig.width === res.w && sceneConfig.height === res.h
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Color & Style */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Palette size={13} />
                Колір фону холста
              </h3>

              {/* Color Presets */}
              <div className="grid grid-cols-2 gap-2">
                {/* Reference Studio Gray */}
                <button
                  onClick={() =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      backgroundType: 'color',
                      backgroundColor: '#E5E6E8',
                    }))
                  }
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition ${
                    sceneConfig.backgroundColor === '#E5E6E8' && sceneConfig.backgroundType === 'color'
                      ? 'border-indigo-500 bg-neutral-800'
                      : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-neutral-400 shrink-0" style={{ backgroundColor: '#E5E6E8' }} />
                  <div>
                    <div className="text-xs font-medium text-white">Студійний сірий</div>
                    <div className="text-[10px] text-neutral-400">#E5E6E8 (з фото)</div>
                  </div>
                </button>

                {/* Clean White */}
                <button
                  onClick={() =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      backgroundType: 'color',
                      backgroundColor: '#F8F9FA',
                    }))
                  }
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition ${
                    sceneConfig.backgroundColor === '#F8F9FA' && sceneConfig.backgroundType === 'color'
                      ? 'border-indigo-500 bg-neutral-800'
                      : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: '#F8F9FA' }} />
                  <div>
                    <div className="text-xs font-medium text-white">Чистий білий</div>
                    <div className="text-[10px] text-neutral-400">Minimal White</div>
                  </div>
                </button>

                {/* Warm Paper */}
                <button
                  onClick={() =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      backgroundType: 'linear-gradient',
                      backgroundColor: '#EBE7DF',
                      backgroundColor2: '#DFD8CC',
                      gradientAngle: 135,
                    }))
                  }
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition ${
                    sceneConfig.backgroundType === 'linear-gradient' && sceneConfig.backgroundColor === '#EBE7DF'
                      ? 'border-indigo-500 bg-neutral-800'
                      : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-neutral-400 shrink-0" style={{ backgroundColor: '#EBE7DF' }} />
                  <div>
                    <div className="text-xs font-medium text-white">Теплий папір</div>
                    <div className="text-[10px] text-neutral-400">Warm Sand</div>
                  </div>
                </button>

                {/* Dark Mode */}
                <button
                  onClick={() =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      backgroundType: 'color',
                      backgroundColor: '#18181B',
                    }))
                  }
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition ${
                    sceneConfig.backgroundColor === '#18181B' && sceneConfig.backgroundType === 'color'
                      ? 'border-indigo-500 bg-neutral-800'
                      : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-neutral-600 shrink-0" style={{ backgroundColor: '#18181B' }} />
                  <div>
                    <div className="text-xs font-medium text-white">Темний графіт</div>
                    <div className="text-[10px] text-neutral-400">Dark Studio</div>
                  </div>
                </button>
              </div>

              {/* Custom color picker */}
              <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-neutral-200 block">Довільний колір</span>
                    <span className="text-[11px] text-neutral-400">Введіть або скопіюйте HEX-код</span>
                  </div>
                  <HexColorPickerInput
                    value={sceneConfig.backgroundColor}
                    onChange={(hex) =>
                      onChangeSceneConfig((prev) => ({
                        ...prev,
                        backgroundColor: hex,
                      }))
                    }
                    label="Колір фону"
                  />
                </div>

                {/* If gradient, also show second color */}
                {(sceneConfig.backgroundType === 'linear-gradient' || sceneConfig.backgroundType === 'radial-gradient') && (
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-neutral-700/50">
                    <div>
                      <span className="text-xs font-medium text-neutral-200 block">Другий колір градієнта</span>
                      <span className="text-[11px] text-neutral-400">Кінцевий відтінок</span>
                    </div>
                    <HexColorPickerInput
                      value={sceneConfig.backgroundColor2}
                      onChange={(hex) =>
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          backgroundColor2: hex,
                        }))
                      }
                      label="Другий колір градієнта"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: WIDGET INSPECTOR (EXACT PIXELS, LAYERS, 360° ROTATION) ================= */}
        {activeTab === 'widget' && (() => {
          const allSlotIds = ['phone', ...cards.map((c) => c.id)];

          const effectiveLayerOrder = (() => {
            const current = sceneConfig.layerOrder || [];
            const valid = current.filter((id) => allSlotIds.includes(id));
            if (!valid.includes('phone')) valid.push('phone');
            for (const id of allSlotIds) {
              if (!valid.includes(id)) valid.push(id);
            }
            return valid;
          })();

          const getSlotDetails = (id: string) => {
            if (id === 'phone') {
              return {
                id: 'phone',
                title: 'iPhone 16 Pro',
                category: 'Телефон (Portrait 9:16)',
                baseW: PHONE_BASE_WIDTH,
                baseH: PHONE_BASE_HEIGHT,
                icon: '📱',
                image: phoneImage,
                isPhone: true,
              };
            }
            const idx = cards.findIndex((c) => c.id === id);
            const card = cards[idx];
            const dims = getWidgetBaseDimensions(card?.widgetType);
            const typeLabels: Record<string, string> = {
              phone: 'Смартфон (iPhone)',
              post: 'Instagram Пост',
              story: 'Stories 9:16',
              quote: 'Відгук / Цитата',
              square: 'Квадрат 1:1',
            };
            const iconMap: Record<string, string> = {
              phone: '📱',
              post: '📄',
              story: '📱',
              quote: '💬',
              square: '🖼️',
            };

            return {
              id,
              title: card?.title || `Картка #${idx + 1}`,
              category: typeLabels[card?.widgetType || 'post'] || `Картка #${idx + 1}`,
              baseW: dims.width,
              baseH: dims.height,
              icon: iconMap[card?.widgetType || 'post'] || '📄',
              image: card?.imageUrl || null,
              isPhone: false,
            };
          };

          // If no widget is currently selected, show the widget selection picker
          if (!selectedSlotId || !selectedTransform) {
            return (
              <div className="space-y-4">
                {/* Add Widget Button Hero */}
                <button
                  onClick={onOpenAddWidgetModal}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <Plus size={16} />
                  <span>Додати новий віджет</span>
                </button>

                <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Box size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-white">Оберіть віджет для налаштування</h3>
                  <p className="text-[11px] text-neutral-400 max-w-[280px] mx-auto">
                    Клікніть на об'єкт на холсті або нижче для точних px розмірів, зміни шару та повороту.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Віджети на сцені ({allSlotIds.length})
                    </span>
                    <button
                      onClick={onOpenAddWidgetModal}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Додати</span>
                    </button>
                  </div>

                  {allSlotIds.map((id) => {
                    const info = getSlotDetails(id);
                    const layerIndex = effectiveLayerOrder.indexOf(id);
                    const layerNum = layerIndex >= 0 ? layerIndex + 1 : 1;

                    return (
                      <div
                        key={id}
                        onClick={() => onSelectSlot(id)}
                        className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-800/40 hover:border-indigo-500/60 hover:bg-neutral-800/80 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-11 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center overflow-hidden shrink-0">
                            {info.image ? (
                              <img src={info.image} alt={info.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base">{info.icon}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                              {info.title}
                            </div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 truncate">
                              <span>{info.category}</span>
                              <span>•</span>
                              <span>Шар {layerNum}/{effectiveLayerOrder.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSlot(id);
                            }}
                            className="px-2 py-1 text-[11px] font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition"
                          >
                            Вибрати
                          </button>
                          {!info.isPhone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteWidget(id);
                              }}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Видалити віджет"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // A widget IS selected: render full inspector
          const currentSlotInfo = getSlotDetails(selectedSlotId);
          const baseW = currentSlotInfo.baseW;
          const baseH = currentSlotInfo.baseH;
          const currentW = Math.round(baseW * selectedTransform.scale);
          const currentH = Math.round(baseH * selectedTransform.scale);

          const currentLayerIdx = effectiveLayerOrder.indexOf(selectedSlotId);
          const isTop = currentLayerIdx === effectiveLayerOrder.length - 1;
          const isBottom = currentLayerIdx === 0;
          const layerPosition = currentLayerIdx >= 0 ? currentLayerIdx + 1 : 1;

          const currIndexInAll = allSlotIds.indexOf(selectedSlotId);
          const prevId = allSlotIds[(currIndexInAll - 1 + allSlotIds.length) % allSlotIds.length];
          const nextId = allSlotIds[(currIndexInAll + 1) % allSlotIds.length];

          return (
            <div className="space-y-6">
              {/* Top Selected Widget Hero Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-neutral-800/60 to-neutral-800/80 border border-indigo-500/40 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-12 rounded-lg bg-neutral-900 border border-indigo-500/50 flex items-center justify-center overflow-hidden shrink-0 shadow">
                      {currentSlotInfo.image ? (
                        <img src={currentSlotInfo.image} alt="Selected" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{currentSlotInfo.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white tracking-tight truncate">{currentSlotInfo.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono shrink-0">
                          {selectedSlotId}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        {currentSlotInfo.category} • Шар {layerPosition}/{effectiveLayerOrder.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!currentSlotInfo.isPhone && (
                      <button
                        onClick={() => onDeleteWidget(selectedSlotId)}
                        className="text-[11px] px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/60 flex items-center gap-1 transition"
                        title="Видалити віджет (можна відмінити через Undo)"
                      >
                        <Trash2 size={12} />
                        <span>Видалити</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectSlot('')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
                      title="Зняти виділення"
                    >
                      Зняти вибір
                    </button>
                  </div>
                </div>

                {/* Quick Prev / Next Widget Switcher */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-700/50 text-xs">
                  <button
                    onClick={() => onSelectSlot(prevId)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-300 transition"
                  >
                    <ArrowLeft size={12} />
                    <span>Попередній</span>
                  </button>
                  <span className="text-[10px] text-neutral-500">
                    Віджет {currIndexInAll + 1} з {allSlotIds.length}
                  </span>
                  <button
                    onClick={() => onSelectSlot(nextId)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-300 transition"
                  >
                    <span>Наступний</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Quote text editor (only for quote widgets) */}
              {selectedCard?.widgetType === 'quote' && (
                <div className="space-y-2.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Quote size={13} />
                    Текст та автор цитати
                  </span>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Текст відгуку (Quote)</label>
                    <textarea
                      rows={2}
                      value={selectedCard.customText || ''}
                      onChange={(e) => {
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          cards: prev.cards.map((c) =>
                            c.id === selectedCard.id ? { ...c, customText: e.target.value } : c
                          ),
                        }));
                      }}
                      placeholder="«Неймовірна чіткість SVG та зручне керування шарами!»"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white resize-none focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Ім'я автора</label>
                    <input
                      type="text"
                      value={selectedCard.customAuthor || ''}
                      onChange={(e) => {
                        onChangeSceneConfig((prev) => ({
                          ...prev,
                          cards: prev.cards.map((c) =>
                            c.id === selectedCard.id ? { ...c, customAuthor: e.target.value } : c
                          ),
                        }));
                      }}
                      placeholder="Олена Ковальчук"
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* HEART / LIKE TOGGLE CONTROL (ЛАЙКНУТО ЧИ НІ) */}
              {(isPhoneSelected || selectedCard?.widgetType !== 'quote') && (() => {
                const isSelectedLiked = isPhoneSelected
                  ? sceneConfig.phoneIsLiked !== false
                  : (selectedCard?.isLiked ?? false);

                const handleToggleCurrentLiked = (val: boolean) => {
                  if (isPhoneSelected) {
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      phoneIsLiked: val,
                    }));
                  } else if (selectedCard) {
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      cards: prev.cards.map((c) =>
                        c.id === selectedCard.id ? { ...c, isLiked: val } : c
                      ),
                    }));
                  }
                };

                return (
                  <div className="p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                        <Heart
                          size={14}
                          className={isSelectedLiked ? 'text-rose-500 fill-rose-500' : 'text-neutral-400'}
                        />
                        Налаштування сердечка (Лайк)
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isSelectedLiked
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelectedLiked ? 'bg-rose-500 animate-pulse' : 'bg-neutral-500'
                          }`}
                        />
                        {isSelectedLiked ? 'Лайкнуто (Червоне)' : 'Без лайка (Контур)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCurrentLiked(true)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition border ${
                          isSelectedLiked
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30 font-semibold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        <Heart size={14} className="fill-current text-white" />
                        <span>❤️ Лайкнуто</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCurrentLiked(false)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition border ${
                          !isSelectedLiked
                            ? 'bg-neutral-700 text-white border-neutral-500 shadow font-semibold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        <Heart size={14} className="stroke-current" />
                        <span>🤍 Без лайка</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 1. EXACT PIXEL DIMENSIONS (Width px & Height px with locked proportions) */}
              <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Sliders size={13} className="text-indigo-400" />
                    Точні розміри у пікселях
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                    <Lock size={10} />
                    Пропорції 100%
                  </span>
                </div>

                {/* Width px & Height px inputs */}
                <div className="grid grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Ширина (Width px)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={50}
                        max={3000}
                        step={1}
                        value={currentW}
                        onChange={(e) => {
                          const w = parseInt(e.target.value, 10);
                          if (w && w > 0) {
                            handleUpdateSelectedTransform({
                              scale: Number((w / baseW).toFixed(4)),
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                        placeholder={`${baseW}`}
                      />
                      <span className="absolute right-2.5 top-1.5 text-[10px] text-neutral-500 font-mono pointer-events-none">
                        px
                      </span>
                    </div>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block font-mono">
                      базова: {baseW}px
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Висота (Height px)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={50}
                        max={4000}
                        step={1}
                        value={currentH}
                        onChange={(e) => {
                          const h = parseInt(e.target.value, 10);
                          if (h && h > 0) {
                            handleUpdateSelectedTransform({
                              scale: Number((h / baseH).toFixed(4)),
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                        placeholder={`${baseH}`}
                      />
                      <span className="absolute right-2.5 top-1.5 text-[10px] text-neutral-500 font-mono pointer-events-none">
                        px
                      </span>
                    </div>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block font-mono">
                      базова: {baseH}px
                    </span>
                  </div>
                </div>

                {/* Scale range slider */}
                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Масштаб віджета</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {Math.round(selectedTransform.scale * 100)}% ({selectedTransform.scale.toFixed(2)}x)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.01"
                    value={selectedTransform.scale}
                    onChange={(e) =>
                      handleUpdateSelectedTransform({ scale: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>30%</span>
                    <span>100% (1x)</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Quick scale presets chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { s: 0.6, label: '60%' },
                    { s: 0.8, label: '80%' },
                    { s: 1.0, label: '100% (1x)' },
                    { s: 1.2, label: '120%' },
                    { s: 1.4, label: '140%' },
                    { s: 1.6, label: '160%' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleUpdateSelectedTransform({ scale: preset.s })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition font-mono ${
                        Math.abs(selectedTransform.scale - preset.s) < 0.02
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. LAYER REORDERING / Z-INDEX (ПОМІТЯ СЛОЙ) */}
              <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-400" />
                    Порядок шарів (Z-Index)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenAddWidgetModal}
                      className="text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 px-2 py-0.5 rounded border border-indigo-500/30 transition"
                      title="Додати новий віджет на сцену"
                    >
                      <Plus size={11} />
                      <span>+ Додати</span>
                    </button>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                      Шар {layerPosition} з {effectiveLayerOrder.length} {isTop ? '• Верхній' : isBottom ? '• Нижній' : ''}
                    </span>
                  </div>
                </div>

                {/* 4 Quick Layer Reorder Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isTop}
                    onClick={() => onReorderLayer(selectedSlotId, 'front')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    title="Перемістити на самий верхній шар"
                  >
                    <ChevronsUp size={14} className="text-indigo-400" />
                    <span>На самий верх</span>
                  </button>

                  <button
                    disabled={isTop}
                    onClick={() => onReorderLayer(selectedSlotId, 'up')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    title="Підняти на один шар вище"
                  >
                    <ChevronUp size={14} className="text-indigo-400" />
                    <span>Вище на 1 шар</span>
                  </button>

                  <button
                    disabled={isBottom}
                    onClick={() => onReorderLayer(selectedSlotId, 'down')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    title="Опустити на один шар нижче"
                  >
                    <ChevronDown size={14} className="text-indigo-400" />
                    <span>Нижче на 1 шар</span>
                  </button>

                  <button
                    disabled={isBottom}
                    onClick={() => onReorderLayer(selectedSlotId, 'back')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    title="Перемістити на самий задній шар"
                  >
                    <ChevronsDown size={14} className="text-indigo-400" />
                    <span>На самий низ</span>
                  </button>
                </div>

                {/* Visual Stack Hierarchy (Top to Bottom) */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-neutral-400 block font-medium">
                    Поточна стопка накладання (згори донизу):
                  </span>
                  <div className="space-y-1">
                    {[...effectiveLayerOrder].reverse().map((layerId, reverseIdx) => {
                      const isThisSelected = layerId === selectedSlotId;
                      const itemNum = effectiveLayerOrder.length - reverseIdx;
                      const layerInfo = getSlotDetails(layerId);

                      return (
                        <div
                          key={layerId}
                          onClick={() => onSelectSlot(layerId)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                            isThisSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-white font-medium shadow-sm'
                              : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono opacity-60 w-3 text-center shrink-0">
                              {itemNum}
                            </span>
                            <span className="text-xs shrink-0">{layerInfo.icon}</span>
                            <span className="truncate max-w-[150px]">{layerInfo.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isThisSelected ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold">
                                Вибрано
                              </span>
                            ) : (
                              <span className="text-[10px] opacity-50">Шар {itemNum}</span>
                            )}
                            {layerId !== 'phone' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteWidget(layerId);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                                title="Видалити цей віджет"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. 360° CIRCULAR ROTATION (ПОВРОЩАТЬ ПО КРУГУ) */}
              <WidgetRotationDial
                rotation={selectedTransform.rotation}
                onChange={(newRot) => handleUpdateSelectedTransform({ rotation: newRot })}
                title="Поворот по колу 360°"
              />

              {/* 4. POSITION COORDINATES (X, Y) */}
              <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Move size={13} className="text-indigo-400" />
                    Позиція на холсті (px)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    X: {selectedTransform.x}px • Y: {selectedTransform.y}px
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Координата X</label>
                    <input
                      type="number"
                      value={selectedTransform.x}
                      onChange={(e) =>
                        handleUpdateSelectedTransform({ x: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Координата Y</label>
                    <input
                      type="number"
                      value={selectedTransform.y}
                      onChange={(e) =>
                        handleUpdateSelectedTransform({ y: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick alignment helpers */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleUpdateSelectedTransform({
                        x: Math.round((sceneConfig.width - currentW) / 2),
                      })
                    }
                    className="py-1.5 px-2 text-[11px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
                  >
                    По центру X
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateSelectedTransform({
                        y: Math.round((sceneConfig.height - currentH) / 2),
                      })
                    }
                    className="py-1.5 px-2 text-[11px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
                  >
                    По центру Y
                  </button>
                </div>
              </div>

              {/* 5. IMAGE REPLACEMENT FOR THIS WIDGET */}
              <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-indigo-400" />
                    Фотографія віджета
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {currentSlotInfo.image ? 'Завантажено' : 'Плейсхолдер'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        try {
                          const res = await optimizeImageFile(file);
                          if (isPhoneSelected) {
                            onUpdatePhoneImage(res);
                          } else {
                            onUpdateCardImage(selectedSlotId, res);
                          }
                          onShowToast('Фото успішно оновлено!');
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="w-12 h-14 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-indigo-500 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer transition"
                    title="Перетягніть фото сюди або виберіть файл"
                  >
                    {currentSlotInfo.image ? (
                      <img src={currentSlotInfo.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{currentSlotInfo.icon}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      id={`widget-inspector-image-${selectedSlotId}`}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await optimizeImageFile(file);
                            if (isPhoneSelected) {
                              onUpdatePhoneImage(res);
                            } else {
                              onUpdateCardImage(selectedSlotId, res);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor={`widget-inspector-image-${selectedSlotId}`}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer transition shadow-md shadow-indigo-600/20"
                    >
                      <UploadCloud size={13} />
                      <span>{currentSlotInfo.image ? 'Замінити фото' : 'Завантажити фото'}</span>
                    </label>

                    {currentSlotInfo.image && (
                      <button
                        onClick={() => {
                          if (isPhoneSelected) {
                            onUpdatePhoneImage(null);
                          } else {
                            onUpdateCardImage(selectedSlotId, null);
                          }
                        }}
                        className="block text-[11px] text-rose-400 hover:text-rose-300 transition"
                      >
                        Скинути до плейсхолдера
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= TAB: SHADOWS & 360° LIGHT ================= */}
        {activeTab === 'shadows' && (
          <div className="space-y-6">
            {/* Toggle Shadows On/Off */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/80">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${shadowEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-700 text-neutral-400'}`}>
                  <Sun size={17} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Студійні тіні</div>
                  <div className="text-[11px] text-neutral-400">
                    {shadowEnabled ? 'Тіні увімкнено (Вкл)' : 'Тіні вимкнено (Викл)'}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onChangeSceneConfig((prev) => ({
                    ...prev,
                    shadowEnabled: !prev.shadowEnabled,
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  shadowEnabled
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {shadowEnabled ? 'ВКЛ' : 'ВИКЛ'}
              </button>
            </div>

            {/* 360 Sun Angle Dial Knob */}
            <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60">
              <SunAngleKnob
                angle={lightAngle}
                disabled={!shadowEnabled}
                onChange={(newAngle) =>
                  onChangeSceneConfig((prev) => ({
                    ...prev,
                    lightAngle: newAngle,
                  }))
                }
              />
            </div>

            {/* Shadow Distance & Blur Controls */}
            <div className="space-y-4">
              {/* Shadow Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Відстань відкидання тіні (Висота підйому)</span>
                  <span className="font-mono text-amber-400">{shadowDistance}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="1"
                  disabled={!shadowEnabled}
                  value={shadowDistance}
                  onChange={(e) =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      shadowDistance: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-30"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>0px (Впритул)</span>
                  <span>26px (Студія)</span>
                  <span>70px (Високо)</span>
                </div>
              </div>

              {/* Shadow Softness / Blur */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>М'якість розмиття (Blur radius)</span>
                  <span className="font-mono text-amber-400">{shadowSoftness}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="2"
                  disabled={!shadowEnabled}
                  value={shadowSoftness}
                  onChange={(e) =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      shadowSoftness: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Shadow Intensity / Darkness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Інтенсивність / Темнота тіні</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(shadowIntensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.8"
                  step="0.05"
                  disabled={!shadowEnabled}
                  value={shadowIntensity}
                  onChange={(e) =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      shadowIntensity: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-30"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: CONTENT & PHOTOS ================= */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Batch Upload Hero Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-neutral-800/40 to-neutral-800/80 border border-indigo-500/20 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <UploadCloud size={15} />
                  Швидке завантаження (Batch)
                </span>
                <span className="text-[10px] text-neutral-400">до 5 фото</span>
              </div>
              <p className="text-xs text-neutral-400 mb-3">
                Виберіть до 5 фото — вони автоматично заповнять телефон та 4 картки по черзі.
              </p>
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleBatchUpload}
                className="hidden"
                id="batch-upload-input"
              />
              <label
                htmlFor="batch-upload-input"
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-indigo-600/20"
              >
                <UploadCloud size={14} />
                Завантажити всі фото одразу
              </label>
            </div>

            {/* Profile Info Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sliders size={13} />
                Профіль Instagram
              </h3>

              {/* Username & Title */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Юзернейм</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      onChangeSceneConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, username: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="@subtleflowco"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Заголовок шапки</label>
                  <input
                    type="text"
                    value={profile.headerTitle}
                    onChange={(e) =>
                      onChangeSceneConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, headerTitle: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Social Media"
                  />
                </div>
              </div>

              {/* Avatar Settings */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAvatarBoxDragOver(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAvatarBoxDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAvatarBoxDragOver(false);
                  }}
                  onDrop={handleAvatarDrop}
                  className={`relative group w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border transition-all ${
                    isAvatarBoxDragOver
                      ? 'border-indigo-500 ring-4 ring-indigo-500/30 scale-105'
                      : 'border-neutral-600 hover:border-neutral-400'
                  }`}
                  title="Перетягніть сюди файл логотипу / аватара"
                >
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-serif font-bold text-white text-base"
                      style={{ backgroundColor: profile.avatarBgColor }}
                    >
                      {profile.avatarMonogram}
                    </div>
                  )}
                  {isAvatarBoxDragOver && (
                    <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center text-[10px] text-white font-bold">
                      + Лого
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-file-input"
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-200 cursor-pointer font-medium transition"
                    >
                      {profile.avatarUrl ? 'Змінити аватар' : 'Завантажити фото'}
                    </label>
                    {profile.avatarUrl && (
                      <button
                        onClick={() =>
                          onChangeSceneConfig((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatarUrl: null },
                          }))
                        }
                        className="text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        Видалити
                      </button>
                    )}
                  </div>
                  {!profile.avatarUrl && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400">Літера:</span>
                        <input
                          type="text"
                          maxLength={2}
                          value={profile.avatarMonogram}
                          onChange={(e) =>
                            onChangeSceneConfig((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, avatarMonogram: e.target.value.toUpperCase() },
                            }))
                          }
                          className="w-7 px-1 py-0.5 text-center text-xs rounded bg-neutral-700 border border-neutral-600 text-white font-bold"
                          title="Літера монограми"
                        />
                      </div>
                      <HexColorPickerInput
                        value={profile.avatarBgColor}
                        onChange={(hex) =>
                          onChangeSceneConfig((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatarBgColor: hex },
                          }))
                        }
                        label="Колір монограми"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Likes & Caption */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Кількість лайків</label>
                <input
                  type="text"
                  value={profile.likesCount}
                  onChange={(e) =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, likesCount: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="726 likes"
                />
              </div>

              {/* Phone Heart / Like Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                <div className="flex items-center gap-2">
                  <Heart
                    size={14}
                    className={sceneConfig.phoneIsLiked !== false ? 'text-rose-500 fill-rose-500' : 'text-neutral-400'}
                  />
                  <div>
                    <span className="text-xs font-medium text-neutral-200 block">Сердечко на фото</span>
                    <span className="text-[10px] text-neutral-400 block">Стан кнопки Like</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      phoneIsLiked: prev.phoneIsLiked === false ? true : false,
                    }))
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    sceneConfig.phoneIsLiked !== false
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  {sceneConfig.phoneIsLiked !== false ? '❤️ Лайкнуто' : '🤍 Без лайка'}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Текст опису (Caption)</label>
                <textarea
                  rows={2}
                  value={profile.caption}
                  onChange={(e) =>
                    onChangeSceneConfig((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, caption: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Instagram post caption..."
                />
              </div>
            </div>

            {/* Individual Slot Managers */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Індивідуальні слоти</span>
                <span className="text-[11px] lowercase text-neutral-500">клікніть для вибору</span>
              </h3>

              {/* Slot 0: Phone */}
              <div
                onClick={() => onSelectSlot('phone')}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-3 ${
                  selectedSlotId === 'phone'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                }`}
              >
                <div className="w-12 h-16 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                  {phoneImage ? (
                    <img src={phoneImage} alt="Phone" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-neutral-500 font-mono text-center">9:16</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    📱 Телефон (9:16 Portrait)
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {phoneImage ? 'Фото завантажено' : 'Порожній плейсхолдер'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      id="phone-image-input"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await optimizeImageFile(file);
                            onUpdatePhoneImage(res);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="phone-image-input"
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 cursor-pointer font-medium"
                    >
                      {phoneImage ? 'Замінити' : 'Завантажити'}
                    </label>
                    {phoneImage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePhoneImage(null);
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300"
                      >
                        Скинути
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Slots 1-4: Cards */}
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => onSelectSlot(card.id)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-3 ${
                    selectedSlotId === card.id
                      ? 'border-indigo-500 bg-indigo-950/20'
                      : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="w-12 h-14 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-neutral-500 font-mono text-center">#{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      📄 Картка {idx + 1} ({card.title})
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {card.imageUrl ? 'Фото завантажено' : 'Текстовий плейсхолдер'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        id={`card-input-${card.id}`}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const res = await optimizeImageFile(file);
                              onUpdateCardImage(card.id, res);
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor={`card-input-${card.id}`}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 cursor-pointer font-medium"
                      >
                        {card.imageUrl ? 'Замінити' : 'Завантажити'}
                      </label>
                      {card.imageUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateCardImage(card.id, null);
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300"
                        >
                          Скинути
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: TRANSFORM & SCALE ================= */}
        {activeTab === 'transform' && (
          <div className="space-y-6">
            <div className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/60 text-xs text-neutral-300">
              💡 <strong>Збереження пропорцій:</strong> Кожен повзунок масштабує віджет строго пропорційно (Aspect Ratio Locked), зберігаючи ідеальну чіткість SVG.
            </div>

            {/* Master Card Scale */}
            <div className="space-y-2 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-400" />
                  Загальний масштаб карток (Всі 4 разом)
                </span>
                <span className="font-mono text-indigo-400 text-xs">
                  {Math.round(cards[0].transform.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.6"
                step="0.02"
                value={cards[0].transform.scale}
                onChange={(e) => handleMasterCardScale(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>40%</span>
                <span>100% (Еталон)</span>
                <span>160%</span>
              </div>
            </div>

            {/* Phone Scale */}
            <div className="space-y-2 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  📱 Масштаб Телефону
                </span>
                <span className="font-mono text-indigo-400 text-xs">
                  {Math.round(phoneTransform.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.6"
                step="0.02"
                value={phoneTransform.scale}
                onChange={(e) =>
                  onChangeSceneConfig((prev) => ({
                    ...prev,
                    phoneTransform: { ...prev.phoneTransform, scale: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>40%</span>
                <span>100%</span>
                <span>160%</span>
              </div>
            </div>

            {/* Selected Element Detailed Fine-Tuning */}
            {selectedTransform ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300">
                    Тонке налаштування: {isPhoneSelected ? 'Телефон' : selectedCard?.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono">
                    Вибрано
                  </span>
                </div>

                {/* Scale of selected element */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Індивідуальний масштаб</span>
                    <span className="font-mono text-indigo-400">{Math.round(selectedTransform.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.8"
                    step="0.02"
                    value={selectedTransform.scale}
                    onChange={(e) => handleUpdateSelectedTransform({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span className="flex items-center gap-1">
                      <RotateCw size={12} />
                      Кут нахилу (Кут повороту)
                    </span>
                    <span className="font-mono text-indigo-400">{selectedTransform.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={selectedTransform.rotation}
                    onChange={(e) => handleUpdateSelectedTransform({ rotation: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>-45°</span>
                    <span>0°</span>
                    <span>+45°</span>
                  </div>
                </div>

                {/* Position X and Y */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-0.5">Позиція X (px)</label>
                    <input
                      type="number"
                      value={selectedTransform.x}
                      onChange={(e) => handleUpdateSelectedTransform({ x: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-0.5">Позиція Y (px)</label>
                    <input
                      type="number"
                      value={selectedTransform.y}
                      onChange={(e) => handleUpdateSelectedTransform({ y: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Клікніть на телефон або картку на сцені для індивідуального налаштування
              </div>
            )}

            {/* Reset to Reference Layout */}
            <button
              onClick={onResetTransforms}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center gap-2 border border-neutral-700 transition"
            >
              <RefreshCw size={13} />
              Скинути позиції до еталонного фото
            </button>
          </div>
        )}

        {/* ================= TAB: PRESETS (LOCALSTORAGE + JSON) ================= */}
        {activeTab === 'presets' && (
          <PresetsTab
            sceneConfig={sceneConfig}
            onChangeSceneConfig={onChangeSceneConfig}
            onShowToast={onShowToast}
          />
        )}

        {/* ================= TAB: EXPORT ================= */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Роздільна здатність растрового експорту
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setExportRes(1)}
                  className={`py-2 px-2 text-xs rounded-lg border font-medium transition text-center ${
                    exportRes === 1
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">1x HD</div>
                  <div className="text-[10px] opacity-75">{sceneConfig.width} × {sceneConfig.height}</div>
                </button>
                <button
                  onClick={() => setExportRes(2)}
                  className={`py-2 px-2 text-xs rounded-lg border font-medium transition text-center ${
                    exportRes === 2
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">2x 2K</div>
                  <div className="text-[10px] opacity-75">{sceneConfig.width * 2} × {sceneConfig.height * 2}</div>
                </button>
                <button
                  onClick={() => setExportRes(4)}
                  className={`py-2 px-2 text-xs rounded-lg border font-medium transition text-center ${
                    exportRes === 4
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">4x 4K UHD</div>
                  <div className="text-[10px] opacity-75">{sceneConfig.width * 4} × {sceneConfig.height * 4}</div>
                </button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2.5">
              {/* Pure SVG Vector Export */}
              <button
                onClick={() => onExport('svg', exportRes)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-emerald-900/20 transition"
              >
                <span className="flex items-center gap-2">
                  <FileCode size={16} />
                  <span>Експортувати <strong>SVG</strong> (Чистий Вектор)</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded font-mono">
                  Lossless
                </span>
              </button>

              {/* PNG Export */}
              <button
                onClick={() => onExport('png', exportRes)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-indigo-900/20 transition"
              >
                <span className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Експортувати <strong>PNG</strong> ({exportRes}x чіткість)</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded font-mono">
                  Hi-Res
                </span>
              </button>

              {/* JPEG Export */}
              <button
                onClick={() => onExport('jpeg', exportRes)}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-between border border-neutral-700 transition"
              >
                <span className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Експортувати <strong>JPEG</strong></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded font-mono">
                  JPG
                </span>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-neutral-700 transition"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copied ? 'Скопійовано в буфер обміну!' : 'Скопіювати зображення в буфер'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
