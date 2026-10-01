import React, { useState } from 'react';
import { ExportResolution, SceneConfig } from '../types';
import { Download, FileCode, Copy, Check, X, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneConfig: SceneConfig;
  onExport: (format: 'png' | 'jpeg' | 'svg', resolution: ExportResolution) => void;
  onCopyClipboard: (resolution: ExportResolution) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  sceneConfig,
  onExport,
  onCopyClipboard,
}) => {
  const [exportRes, setExportRes] = useState<ExportResolution>(2);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    onCopyClipboard(exportRes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerExport = (format: 'png' | 'jpeg' | 'svg') => {
    onExport(format, exportRes);
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Експорт макета</h2>
              <p className="text-[11px] text-neutral-400">
                Завантажте векторний SVG або зображення високої чіткості
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

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Resolution Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              Роздільна здатність растрового експорту
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportRes(1)}
                className={`py-2 px-2 text-xs rounded-xl border font-medium transition text-center ${
                  exportRes === 1
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">1x HD</div>
                <div className="text-[10px] opacity-75">{sceneConfig.width} × {sceneConfig.height}</div>
              </button>
              <button
                type="button"
                onClick={() => setExportRes(2)}
                className={`py-2 px-2 text-xs rounded-xl border font-medium transition text-center ${
                  exportRes === 2
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-2 ring-indigo-500/20'
                    : 'border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1">
                  <span>2x 2K</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] opacity-75">{sceneConfig.width * 2} × {sceneConfig.height * 2}</div>
              </button>
              <button
                type="button"
                onClick={() => setExportRes(4)}
                className={`py-2 px-2 text-xs rounded-xl border font-medium transition text-center ${
                  exportRes === 4
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">4x 4K UHD</div>
                <div className="text-[10px] opacity-75">{sceneConfig.width * 4} × {sceneConfig.height * 4}</div>
              </button>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* Pure SVG Vector Export */}
            <button
              type="button"
              onClick={() => handleTriggerExport('svg')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-emerald-900/20 transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <FileCode size={16} />
                <span>Експортувати <strong>SVG</strong> (Вектор)</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded font-mono">
                Lossless
              </span>
            </button>

            {/* PNG Export */}
            <button
              type="button"
              onClick={() => handleTriggerExport('png')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-indigo-900/20 transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Download size={16} />
                <span>Експортувати <strong>PNG</strong> ({exportRes}x чіткість)</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded font-mono">
                Hi-Res
              </span>
            </button>

            {/* JPEG Export */}
            <button
              type="button"
              onClick={() => handleTriggerExport('jpeg')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-between border border-neutral-700 transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Download size={16} />
                <span>Експортувати <strong>JPEG</strong></span>
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded font-mono">
                JPG
              </span>
            </button>

            {/* Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-[0.99]"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'Скопійовано в буфер обміну!' : 'Скопіювати зображення в буфер'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
