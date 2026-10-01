import React, { useState, useRef } from 'react';
import { MockupPreset, SceneConfig } from '../types';
import {
  loadSavedPresets,
  savePresetsToStorage,
  createPresetFromScene,
  applyPresetToScene,
  clonePreset,
  exportPresetsFile,
  parseImportedPresets,
} from '../utils/presetManager';
import {
  Bookmark,
  Plus,
  Copy,
  Download,
  Upload,
  Trash2,
  Check,
  Edit2,
  FileJson,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PresetsTabProps {
  sceneConfig: SceneConfig;
  onChangeSceneConfig: (newConfig: SceneConfig) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const PresetsTab: React.FC<PresetsTabProps> = ({
  sceneConfig,
  onChangeSceneConfig,
  onShowToast,
}) => {
  const [presets, setPresets] = useState<MockupPreset[]>(() => loadSavedPresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  // Save changes to localStorage whenever presets state changes
  const updatePresets = (updated: MockupPreset[]) => {
    setPresets(updated);
    savePresetsToStorage(updated);
  };

  // 1. Create new preset from current scene settings
  const handleSaveCurrentAsPreset = () => {
    const name = newPresetName.trim() || `Пресет ${presets.length + 1}`;
    const newPreset = createPresetFromScene(name, sceneConfig);
    const updated = [newPreset, ...presets];
    updatePresets(updated);
    setNewPresetName('');
    onShowToast(`Пресет «${newPreset.name}» успішно збережено!`);
  };

  // 2. Apply preset to current scene (retaining user images)
  const handleApplyPreset = (preset: MockupPreset) => {
    const updatedScene = applyPresetToScene(preset, sceneConfig);
    onChangeSceneConfig(updatedScene);
    onShowToast(`Застосовано пресет «${preset.name}»!`);
  };

  // 3. Clone / duplicate preset
  const handleClonePreset = (preset: MockupPreset) => {
    const cloned = clonePreset(preset);
    const updated = [cloned, ...presets];
    updatePresets(updated);
    onShowToast(`Створено клон «${cloned.name}»!`);
  };

  // 4. Delete preset
  const handleDeletePreset = (id: string, name: string) => {
    const updated = presets.filter((p) => p.id !== id);
    updatePresets(updated);
    onShowToast(`Пресет «${name}» видалено`);
  };

  // 5. Rename preset
  const handleStartRename = (preset: MockupPreset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleSaveRename = (id: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    const updated = presets.map((p) =>
      p.id === id ? { ...p, name: editingName.trim(), updatedAt: Date.now() } : p
    );
    updatePresets(updated);
    setEditingId(null);
    onShowToast('Назву пресета оновлено');
  };

  // 6. Export all presets
  const handleExportAll = () => {
    exportPresetsFile(presets, `maket-presets-all-${Date.now()}.json`);
    onShowToast('Всі пресети експортовано у JSON!');
  };

  // 7. Export single preset
  const handleExportSingle = (preset: MockupPreset) => {
    const cleanFilename = preset.name.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-');
    exportPresetsFile(preset, `preset-${cleanFilename}.json`);
    onShowToast(`Пресет «${preset.name}» експортовано!`);
  };

  // 8. Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseImportedPresets(text);
        const updated = [...imported, ...presets];
        updatePresets(updated);
        onShowToast(`Успішно імпортовано ${imported.length} пресет(ів)!`);
      } catch (err: any) {
        console.error('Import error:', err);
        onShowToast(err.message || 'Помилка імпорту JSON файлу', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Save Current Section */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-neutral-800/40 to-neutral-800/80 border border-indigo-500/20 shadow-inner space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <Bookmark size={14} />
            Зберегти поточні налаштування
          </span>
          <span className="text-[10px] text-neutral-400">без картинок</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Зберігає розміри холста, положення та кути віджетів, світло 360°, тіні, фон та тексти.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentAsPreset()}
            placeholder="Введіть назву пресета..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSaveCurrentAsPreset}
            className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition shrink-0 shadow-md shadow-indigo-600/20"
          >
            <Plus size={14} />
            Зберегти
          </button>
        </div>
      </div>

      {/* JSON Import / Export Action Bar */}
      <div className="flex items-center gap-2">
        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportJson}
          className="hidden"
          id="presets-json-file-input"
        />
        <label
          htmlFor="presets-json-file-input"
          className="flex-1 py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition text-center"
        >
          <Upload size={13} className="text-indigo-400" />
          <span>Імпорт JSON</span>
        </label>

        <button
          onClick={handleExportAll}
          className="flex-1 py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition text-center"
        >
          <Download size={13} className="text-emerald-400" />
          <span>Експорт всіх (JSON)</span>
        </button>
      </div>

      {/* Presets List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Layers size={13} />
            Збережені пресети ({presets.length})
          </h3>
          <span className="text-[10px] text-neutral-500 font-mono">localStorage</span>
        </div>

        <div className="space-y-2.5">
          {presets.map((preset) => {
            const isEditing = editingId === preset.id;
            const s = preset.settings;

            return (
              <div
                key={preset.id}
                className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/70 hover:border-neutral-600 transition space-y-2 group"
              >
                {/* Title & Badges */}
                <div className="flex items-center justify-between gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(preset.id)}
                        autoFocus
                        className="w-full px-2 py-0.5 text-xs rounded bg-neutral-900 border border-indigo-500 text-white"
                      />
                      <button
                        onClick={() => handleSaveRename(preset.id)}
                        className="p-1 rounded bg-indigo-600 text-white"
                        title="Зберегти назву"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white truncate block">
                        {preset.name}
                      </span>
                      <button
                        onClick={() => handleStartRename(preset)}
                        className="text-neutral-500 hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition shrink-0"
                        title="Перейменувати"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/80 text-neutral-300 font-mono">
                      {s.width}×{s.height}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-300 font-mono border border-indigo-500/20">
                      {s.canvasRatio}
                    </span>
                  </div>
                </div>

                {/* Details subtitle */}
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>
                    Сонце: {s.lightAngle}° • Тіні: {s.shadowEnabled ? 'ВКЛ' : 'ВИКЛ'} • {s.profile.username}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-700/40">
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-200 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1"
                  >
                    <Sparkles size={11} />
                    Застосувати
                  </button>

                  <button
                    onClick={() => handleClonePreset(preset)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-700/60 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] transition flex items-center gap-1"
                    title="Клонувати пресет"
                  >
                    <Copy size={11} />
                    <span>Клон</span>
                  </button>

                  <button
                    onClick={() => handleExportSingle(preset)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-700/60 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] transition flex items-center gap-1"
                    title="Експортувати в JSON файл"
                  >
                    <FileJson size={11} />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-700/40 hover:bg-rose-900/60 text-neutral-400 hover:text-rose-300 text-[11px] transition"
                    title="Видалити пресет"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
