import { MockupPreset, SceneConfig } from '../types';

const STORAGE_KEY = 'maket_generator_presets_v1';

// Default built-in presets
export const DEFAULT_PRESETS: MockupPreset[] = [
  {
    id: 'preset-reference',
    name: 'Еталонний студійний (з фото)',
    createdAt: 1727770000000,
    updatedAt: 1727770000000,
    settings: {
      width: 1600,
      height: 1100,
      canvasRatio: 'reference',
      backgroundType: 'color',
      backgroundColor: '#E5E6E8',
      backgroundColor2: '#D6D8DC',
      gradientAngle: 135,
      shadowEnabled: true,
      lightAngle: 315,
      shadowDistance: 26,
      shadowIntensity: 1.0,
      shadowSoftness: 28,
      phoneTransform: { x: 230, y: 200, scale: 1.0, rotation: 0 },
      cardsTransforms: [
        { id: 'card-1', transform: { x: 620, y: 160, scale: 1.0, rotation: 0 } },
        { id: 'card-2', transform: { x: 1180, y: 155, scale: 1.0, rotation: 0 } },
        { id: 'card-3', transform: { x: 800, y: 410, scale: 1.0, rotation: -7 } },
        { id: 'card-4', transform: { x: 1030, y: 490, scale: 1.0, rotation: 5 } },
      ],
      profile: {
        username: '@subtleflowco',
        headerTitle: 'Social Media',
        avatarMonogram: 'S',
        avatarBgColor: '#6A7B69',
        likesCount: '726 likes',
        caption: 'subtleflowco Instagram is a popular photo and video sharing social networking service owned by Meta',
      },
    },
  },
  {
    id: 'preset-instagram-square',
    name: 'Instagram Квадрат 1:1',
    createdAt: 1727770001000,
    updatedAt: 1727770001000,
    settings: {
      width: 1400,
      height: 1400,
      canvasRatio: '1:1',
      backgroundType: 'color',
      backgroundColor: '#F8F9FA',
      backgroundColor2: '#E5E7EB',
      gradientAngle: 135,
      shadowEnabled: true,
      lightAngle: 315,
      shadowDistance: 28,
      shadowIntensity: 1.1,
      shadowSoftness: 32,
      phoneTransform: { x: 180, y: 360, scale: 0.95, rotation: 0 },
      cardsTransforms: [
        { id: 'card-1', transform: { x: 550, y: 310, scale: 0.95, rotation: 0 } },
        { id: 'card-2', transform: { x: 1040, y: 300, scale: 0.95, rotation: 0 } },
        { id: 'card-3', transform: { x: 720, y: 560, scale: 0.95, rotation: -7 } },
        { id: 'card-4', transform: { x: 940, y: 640, scale: 0.95, rotation: 5 } },
      ],
      profile: {
        username: '@creative.flow',
        headerTitle: 'Social Media',
        avatarMonogram: 'C',
        avatarBgColor: '#4F46E5',
        likesCount: '1,420 likes',
        caption: 'Aesthetic minimal carousel layout mockup designed with vector precision',
      },
    },
  },
  {
    id: 'preset-stories-9-16',
    name: 'Stories / Reels 9:16',
    createdAt: 1727770002000,
    updatedAt: 1727770002000,
    settings: {
      width: 1080,
      height: 1920,
      canvasRatio: '9:16',
      backgroundType: 'linear-gradient',
      backgroundColor: '#EBE7DF',
      backgroundColor2: '#DFD8CC',
      gradientAngle: 180,
      shadowEnabled: true,
      lightAngle: 315,
      shadowDistance: 30,
      shadowIntensity: 1.1,
      shadowSoftness: 34,
      phoneTransform: { x: 370, y: 190, scale: 0.95, rotation: 0 },
      cardsTransforms: [
        { id: 'card-1', transform: { x: 130, y: 920, scale: 0.88, rotation: -3 } },
        { id: 'card-2', transform: { x: 610, y: 920, scale: 0.88, rotation: 3 } },
        { id: 'card-3', transform: { x: 190, y: 1300, scale: 0.88, rotation: -6 } },
        { id: 'card-4', transform: { x: 570, y: 1330, scale: 0.88, rotation: 5 } },
      ],
      profile: {
        username: '@daily.story',
        headerTitle: 'Highlights',
        avatarMonogram: 'D',
        avatarBgColor: '#059669',
        likesCount: '890 likes',
        caption: 'Swipe up to explore the full story collection and layout inspiration',
      },
    },
  },
  {
    id: 'preset-youtube-16-9',
    name: 'YouTube / Banner 16:9',
    createdAt: 1727770003000,
    updatedAt: 1727770003000,
    settings: {
      width: 1600,
      height: 900,
      canvasRatio: '16:9',
      backgroundType: 'color',
      backgroundColor: '#18181B',
      backgroundColor2: '#27272A',
      gradientAngle: 135,
      shadowEnabled: true,
      lightAngle: 315,
      shadowDistance: 24,
      shadowIntensity: 1.2,
      shadowSoftness: 30,
      phoneTransform: { x: 220, y: 105, scale: 0.95, rotation: 0 },
      cardsTransforms: [
        { id: 'card-1', transform: { x: 600, y: 80, scale: 0.95, rotation: 0 } },
        { id: 'card-2', transform: { x: 1140, y: 75, scale: 0.95, rotation: 0 } },
        { id: 'card-3', transform: { x: 770, y: 320, scale: 0.95, rotation: -7 } },
        { id: 'card-4', transform: { x: 990, y: 390, scale: 0.95, rotation: 5 } },
      ],
      profile: {
        username: '@dark.studio',
        headerTitle: 'Portfolio',
        avatarMonogram: 'P',
        avatarBgColor: '#D97706',
        likesCount: '3,210 likes',
        caption: 'Dark mode presentation banner with floating cards elevation',
      },
    },
  },
];

/**
 * Loads presets from localStorage or returns default presets
 */
export const loadSavedPresets = (): MockupPreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePresetsToStorage(DEFAULT_PRESETS);
      return DEFAULT_PRESETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRESETS;
  } catch (err) {
    console.error('Failed to load presets from localStorage:', err);
    return DEFAULT_PRESETS;
  }
};

/**
 * Saves presets array to localStorage
 */
export const savePresetsToStorage = (presets: MockupPreset[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets to localStorage:', err);
  }
};

/**
 * Creates a preset payload from the current SceneConfig (without user images)
 */
export const createPresetFromScene = (name: string, config: SceneConfig): MockupPreset => {
  const now = Date.now();
  return {
    id: `preset-${now}-${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim() || `Пресет ${new Date().toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    settings: {
      width: config.width,
      height: config.height,
      canvasRatio: config.canvasRatio,
      backgroundType: config.backgroundType,
      backgroundColor: config.backgroundColor,
      backgroundColor2: config.backgroundColor2,
      gradientAngle: config.gradientAngle,
      shadowEnabled: config.shadowEnabled,
      lightAngle: config.lightAngle,
      shadowDistance: config.shadowDistance,
      shadowIntensity: config.shadowIntensity,
      shadowSoftness: config.shadowSoftness,
      phoneTransform: { ...config.phoneTransform },
      cardsTransforms: config.cards.map((c) => ({
        id: c.id,
        transform: { ...c.transform },
      })),
      profile: {
        username: config.profile.username,
        headerTitle: config.profile.headerTitle,
        avatarMonogram: config.profile.avatarMonogram,
        avatarBgColor: config.profile.avatarBgColor,
        likesCount: config.profile.likesCount,
        caption: config.profile.caption,
      },
    },
  };
};

/**
 * Applies a preset to current SceneConfig while preserving currently uploaded images
 */
export const applyPresetToScene = (preset: MockupPreset, current: SceneConfig): SceneConfig => {
  const s = preset.settings;

  // Map card transforms by id, preserving existing imageUrls
  const updatedCards = current.cards.map((card) => {
    const saved = s.cardsTransforms.find((ct) => ct.id === card.id);
    return {
      ...card,
      transform: saved ? { ...saved.transform } : card.transform,
    };
  });

  return {
    ...current,
    width: s.width,
    height: s.height,
    canvasRatio: s.canvasRatio,
    backgroundType: s.backgroundType,
    backgroundColor: s.backgroundColor,
    backgroundColor2: s.backgroundColor2,
    gradientAngle: s.gradientAngle,
    shadowEnabled: s.shadowEnabled,
    lightAngle: s.lightAngle,
    shadowDistance: s.shadowDistance,
    shadowIntensity: s.shadowIntensity,
    shadowSoftness: s.shadowSoftness,
    phoneTransform: { ...s.phoneTransform },
    cards: updatedCards,
    profile: {
      ...current.profile,
      username: s.profile.username,
      headerTitle: s.profile.headerTitle,
      avatarMonogram: s.profile.avatarMonogram,
      avatarBgColor: s.profile.avatarBgColor,
      likesCount: s.profile.likesCount,
      caption: s.profile.caption,
      // avatarUrl is kept as is from current!
    },
  };
};

/**
 * Clones a preset with a "(Копія)" suffix
 */
export const clonePreset = (preset: MockupPreset): MockupPreset => {
  const now = Date.now();
  return {
    ...preset,
    id: `preset-${now}-${Math.random().toString(36).substr(2, 6)}`,
    name: `${preset.name} (Копія)`,
    createdAt: now,
    updatedAt: now,
    settings: JSON.parse(JSON.stringify(preset.settings)),
  };
};

/**
 * Exports presets array or single preset to a downloadable JSON file
 */
export const exportPresetsFile = (data: MockupPreset[] | MockupPreset, filename = 'maket-presets.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
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
 * Parses and validates an imported JSON string containing preset(s)
 */
export const parseImportedPresets = (jsonString: string): MockupPreset[] => {
  const parsed = JSON.parse(jsonString);
  const items: any[] = Array.isArray(parsed) ? parsed : [parsed];

  const validated: MockupPreset[] = [];
  const now = Date.now();

  for (const item of items) {
    if (item && item.settings && typeof item.settings === 'object') {
      const s = item.settings;
      if (typeof s.width === 'number' && typeof s.height === 'number') {
        validated.push({
          id: `preset-import-${now}-${Math.random().toString(36).substr(2, 6)}`,
          name: typeof item.name === 'string' ? item.name : 'Імпортований пресет',
          createdAt: now,
          updatedAt: now,
          settings: s,
        });
      }
    }
  }

  if (validated.length === 0) {
    throw new Error('Файл не містить валідних налаштувань пресетів мокапу');
  }

  return validated;
};
