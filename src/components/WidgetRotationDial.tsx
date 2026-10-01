import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';

interface WidgetRotationDialProps {
  rotation: number; // in degrees, e.g. -180 to 180 or 0 to 360
  onChange: (newRotation: number) => void;
  title?: string;
}

export const WidgetRotationDial: React.FC<WidgetRotationDialProps> = ({
  rotation,
  onChange,
  title = "Кут повороту віджета",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Normalize rotation to -180..180 for standard display
  const normalizedRotation = rotation;

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return rotation;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // 0 deg at top (12 o'clock)
    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const newAngle = calculateAngle(e.clientX, e.clientY);
    onChange(newAngle);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const newAngle = calculateAngle(e.clientX, e.clientY);
      onChange(newAngle);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const size = 120;
  const radius = 46;
  const center = size / 2;

  // Knob handle position
  const rad = ((normalizedRotation - 90) * Math.PI) / 180;
  const handleX = center + radius * Math.cos(rad);
  const handleY = center + radius * Math.sin(rad);

  return (
    <div className="space-y-3 p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
          <RotateCw size={13} className="text-indigo-400" />
          <span>{title}</span>
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={rotation}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-14 px-1.5 py-0.5 text-center text-xs rounded bg-neutral-900 border border-neutral-700 text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
          />
          <span className="text-xs text-neutral-400 font-mono">°</span>
        </div>
      </div>

      {/* Circular 360 Dial */}
      <div className="flex items-center justify-center">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className="relative select-none cursor-pointer touch-none"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="#18181B"
              stroke="#3F3F46"
              strokeWidth="2"
            />

            {/* Compass tick marks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((tick) => {
              const tickRad = ((tick - 90) * Math.PI) / 180;
              const innerR = radius - 5;
              const outerR = radius;
              return (
                <line
                  key={tick}
                  x1={center + innerR * Math.cos(tickRad)}
                  y1={center + innerR * Math.sin(tickRad)}
                  x2={center + outerR * Math.cos(tickRad)}
                  y2={center + outerR * Math.sin(tickRad)}
                  stroke={tick % 90 === 0 ? "#818CF8" : "#52525B"}
                  strokeWidth={tick % 90 === 0 ? 1.5 : 1}
                />
              );
            })}

            {/* Center pointer line towards current angle */}
            <line
              x1={center}
              y1={center}
              x2={handleX}
              y2={handleY}
              stroke="#6366F1"
              strokeWidth="2"
            />

            {/* Center miniature widget representing current orientation */}
            <g transform={`translate(${center}, ${center}) rotate(${rotation})`}>
              <rect
                x="-10"
                y="-15"
                width="20"
                height="30"
                rx="3"
                fill="#27272A"
                stroke="#A5B4FC"
                strokeWidth="1.5"
              />
              <line x1="-6" y1="-8" x2="6" y2="-8" stroke="#818CF8" strokeWidth="1" />
              <circle cx="0" cy="10" r="1.5" fill="#818CF8" />
            </g>

            {/* Drag Handle */}
            <g transform={`translate(${handleX}, ${handleY})`}>
              <circle cx="0" cy="0" r="11" fill="#4F46E5" opacity="0.25" />
              <circle cx="0" cy="0" r="7" fill="#6366F1" stroke="#FFF" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>

      {/* Slider for smooth rotation */}
      <div className="space-y-1">
        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={rotation}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Quick rotation stepper buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button
          onClick={() => onChange(0)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            rotation === 0
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
        >
          0° (Рівно)
        </button>
        <button
          onClick={() => onChange(Number(rotation) - 5)}
          className="py-1 px-1.5 text-[10px] rounded border bg-neutral-800 border-neutral-700/70 text-neutral-300 hover:text-white transition flex items-center justify-center gap-0.5"
          title="Повернути проти годинникової стрілки на 5°"
        >
          <RotateCcw size={10} /> -5°
        </button>
        <button
          onClick={() => onChange(Number(rotation) + 5)}
          className="py-1 px-1.5 text-[10px] rounded border bg-neutral-800 border-neutral-700/70 text-neutral-300 hover:text-white transition flex items-center justify-center gap-0.5"
          title="Повернути за годинниковою стрілкою на 5°"
        >
          <RotateCw size={10} /> +5°
        </button>
        <button
          onClick={() => onChange(90)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            rotation === 90
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
        >
          90°
        </button>
      </div>
    </div>
  );
};
