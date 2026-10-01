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

export interface CardSlot {
  id: string;
  title: string;
  imageUrl: string | null;
  placeholderText: string;
  transform: WidgetTransform;
}

export type CanvasRatio = 'reference' | '1:1' | '4:5' | '5:4' | '16:9' | '9:16' | 'custom';

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
  cards: CardSlot[];
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
