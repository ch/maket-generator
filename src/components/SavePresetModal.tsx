import React, { useState, useEffect } from 'react';
import { SceneConfig } from '../types';
import {
  createPresetFromScene,
  loadSavedPresets,
  savePresetsToStorage,
} from '../utils/presetManager';
import { Bookmark, X, Check, Sparkles, Layers } from 'lucide-react';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneConfig: SceneConfig;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  sceneConfig,
  onShowToast,
}) => {
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existing = loadSavedPresets();
      setPresetName(`Мій пресет #${existing.length + 1}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = presetName.trim() || `Пресет ${Date.now()}`;
    const newPreset = createPresetFromScene(finalName, sceneConfig);
    const existing = loadSavedPresets();
    const updated = [newPreset, ...existing];
    savePresetsToStorage(updated);
    onShowToast(`Пресет «${finalName}» успішно збережено! ✨`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Bookmark size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Зберегти як пресет</h2>
              <p className="text-[11px] text-neutral-400">
                Збережіть розташування, кути, тіні та розміри макета
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Назва пресета
            </label>
            <input
              type="text"
              autoFocus
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Наприклад: Студійний мінімалізм"
              maxLength={40}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Quick preset summary preview */}
          <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/60 space-y-1.5 text-[11px] text-neutral-300">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Формат холста:
              </span>
              <span className="font-mono text-white">
                {sceneConfig.width} × {sceneConfig.height} px
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Layers size={12} className="text-indigo-400" />
                Кількість елементів:
              </span>
              <span className="font-mono text-white">
                {sceneConfig.cards.length + 1} віджетів
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Світло & Тінь:</span>
              <span className="font-mono text-white">
                {sceneConfig.lightAngle}° ({sceneConfig.shadowDistance}px)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Check size={14} />
              <span>Зберегти пресет</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
