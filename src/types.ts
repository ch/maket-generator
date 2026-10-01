export interface WidgetTransform {
  x: number;
  y: number;
  scale: number; // Aspect-ratio preserving uniform scale
  rotation: number; // in degrees
  zIndex?: number;
}

export interface MockupProfile {
  username: string;
  avatarUrl: string | null;
  avatarMonogram: string;
  avatarBgColor: string;
  headerTitle: string;
  likesCount: string;
  caption: string;
}

export type WidgetType = 'phone' | 'post' | 'story' | 'quote' | 'square';

export interface CardSlot {
  id: string;
  title: string;
  widgetType?: WidgetType;
  imageUrl: string | null;
  placeholderText: string;
  transform: WidgetTransform;
  customText?: string;
  customAuthor?: string;
  isLiked?: boolean; // True = red filled heart, False = gray outline
}

export type CanvasRatio = 'reference' | '1:1' | '4:5' | '5:4' | '16:9' | '9:16' | 'custom';

export const CANVAS_RATIO_PRESETS: Record<
  CanvasRatio,
  { width: number; height: number; label: string; sub: string; ratioDisplay: string }
> = {
  'reference': { width: 1600, height: 1100, label: 'Еталон', sub: '1600 × 1100', ratioDisplay: '16:11' },
  '1:1': { width: 1400, height: 1400, label: '1:1', sub: 'Квадрат (Square)', ratioDisplay: '1:1' },
  '4:5': { width: 1200, height: 1500, label: '4:5', sub: 'Портрет Instagram', ratioDisplay: '4:5' },
  '5:4': { width: 1500, height: 1200, label: '5:4', sub: 'Альбом (Landscape)', ratioDisplay: '5:4' },
  '16:9': { width: 1600, height: 900, label: '16:9', sub: 'Широкоформатний', ratioDisplay: '16:9' },
  '9:16': { width: 1080, height: 1920, label: '9:16', sub: 'Stories / Reels', ratioDisplay: '9:16' },
  'custom': { width: 1600, height: 1100, label: 'Власний', sub: 'Вказати пікселі', ratioDisplay: 'Custom' },
};

export interface SceneConfig {
  width: number;
  height: number;
  canvasRatio: CanvasRatio;
  backgroundType: 'color' | 'linear-gradient' | 'radial-gradient' | 'mesh';
  backgroundColor: string;
  backgroundColor2: string;
  gradientAngle: number;
  shadowEnabled: boolean;
  lightAngle: number; // 0 to 360 degrees (light source position)
  shadowDistance: number; // 0 to 80 px
  shadowIntensity: number; // 0.1 to 1.5
  shadowSoftness: number; // 5 to 60
  phoneTransform: WidgetTransform;
  phoneIsLiked?: boolean; // True = red filled heart, False = gray outline (default: true)
  cards: CardSlot[];
  layerOrder: string[]; // Order of element IDs rendered from back to front
  profile: MockupProfile;
}

export interface MockupPreset {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: {
    width: number;
    height: number;
    canvasRatio: CanvasRatio;
    backgroundType: 'color' | 'linear-gradient' | 'radial-gradient' | 'mesh';
    backgroundColor: string;
    backgroundColor2: string;
    gradientAngle: number;
    shadowEnabled: boolean;
    lightAngle: number;
    shadowDistance: number;
    shadowIntensity: number;
    shadowSoftness: number;
    phoneTransform: WidgetTransform;
    cardsTransforms: Array<{ id: string; transform: WidgetTransform }>;
    layerOrder?: string[];
    profile: {
      username: string;
      headerTitle: string;
      avatarMonogram: string;
      avatarBgColor: string;
      likesCount: string;
      caption: string;
    };
  };
}

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportResolution = 1 | 2 | 3 | 4; // 1x, 2x, 4x

export interface HistorySnapshot {
  sceneConfig: SceneConfig;
  phoneImage: string | null;
  timestamp: number;
  description?: string;
}
