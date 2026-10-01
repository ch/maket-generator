import React, { useState } from 'react';
import { WidgetType } from '../types';
import { FileText, Smartphone, Quote, Square, X, Plus, Sparkles } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (title: string, widgetType: WidgetType) => void;
}

const WIDGET_TYPE_OPTIONS: Array<{
  type: WidgetType;
  title: string;
  sub: string;
  dim: string;
  tag: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'phone',
    title: 'Смартфон (iPhone)',
    sub: 'Реалістичний мокап iPhone з Dynamic Island, скляним екраном та стрічкою',
    dim: '334 × 686 px',
    tag: 'Смартфон',
    icon: <Smartphone size={20} className="text-cyan-400" />,
  },
  {
    type: 'post',
    title: 'Instagram Пост',
    sub: 'Класична картка з фото, реакціями (лайки, коментарі) та шапкою профілю',
    dim: '270 × 396 px',
    tag: 'Популярний',
    icon: <FileText size={20} className="text-indigo-400" />,
  },
  {
    type: 'story',
    title: 'Stories 9:16',
    sub: 'Вертикальна сторіс-картка з фірмовим градієнтним обідком та полем для відповіді',
    dim: '250 × 444 px',
    tag: 'Stories / Reels',
    icon: <Smartphone size={20} className="text-rose-400" />,
  },
  {
    type: 'quote',
    title: 'Відгук / Цитата',
    sub: 'Стильна картка з 5 золотими зірками, лапками цитати та автором',
    dim: '280 × 340 px',
    tag: 'Social Proof',
    icon: <Quote size={20} className="text-amber-400" />,
  },
  {
    type: 'square',
    title: 'Квадратне фото 1:1',
    sub: 'Мінімалістична квадратна картка з фотографією та авторкою',
    dim: '280 × 280 px',
    tag: '1:1 Square',
    icon: <Square size={20} className="text-emerald-400" />,
  },
];

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<WidgetType>('post');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle =
      title.trim() ||
      WIDGET_TYPE_OPTIONS.find((opt) => opt.type === selectedType)?.title ||
      'Новий віджет';
    onAddWidget(finalTitle, selectedType);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Додати новий віджет</h2>
              <p className="text-[11px] text-neutral-400">
                Вкажіть назву та оберіть тип віджету для розміщення на сцені
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Widget Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-200 block">
              Назва віджету
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="наприклад: Відгук клієнта, Новий пост, Анонс..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-neutral-500 block">
              Назва буде відображатися в списку шарів та інспекторі
            </span>
          </div>

          {/* Widget Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-200 block">
              Оберіть тип віджету
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WIDGET_TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/40'
                        : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700/60">
                          {opt.icon}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-neutral-400">
                          {opt.dim}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{opt.title}</div>
                      <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                        {opt.sub}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      <span className="text-[9px] text-indigo-400 font-medium">{opt.tag}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus size={14} />
              <span>Додати на холст</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
