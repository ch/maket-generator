import React, { useRef, useState, useEffect } from 'react';
import { Sun, Compass } from 'lucide-react';

interface SunAngleKnobProps {
  angle: number; // 0 to 360 degrees, 0 = top, clockwise
  onChange: (newAngle: number) => void;
  disabled?: boolean;
}

export const SunAngleKnob: React.FC<SunAngleKnobProps> = ({
  angle,
  onChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert client coordinates to angle (0° at top, clockwise)
  const calculateAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return angle;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Math.atan2(y, x): 0 at 3 o'clock. We want 0 at 12 o'clock, clockwise.
    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    if (deg >= 360) deg -= 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
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

  // Radius for knob circle
  const size = 130;
  const radius = 50;
  const center = size / 2;

  // Sun position on orbit
  const rad = ((angle - 90) * Math.PI) / 180;
  const sunX = center + radius * Math.cos(rad);
  const sunY = center + radius * Math.sin(rad);

  // Opposite shadow direction indicator
  const shadowX = center - (radius * 0.65) * Math.cos(rad);
  const shadowY = center - (radius * 0.65) * Math.sin(rad);

  // Direction label
  const getDirectionName = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'Зверху (Північ)';
    if (deg >= 22.5 && deg < 67.5) return 'Зверху-праворуч';
    if (deg >= 67.5 && deg < 112.5) return 'Справа (Схід)';
    if (deg >= 112.5 && deg < 157.5) return 'Знизу-праворуч';
    if (deg >= 157.5 && deg < 202.5) return 'Знизу (Південь)';
    if (deg >= 202.5 && deg < 247.5) return 'Знизу-ліворуч';
    if (deg >= 247.5 && deg < 292.5) return 'Зліва (Захід)';
    return 'Зверху-ліворуч (Студія)';
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Sun size={14} className="text-amber-400" />
          <span>Напрямок сонця (Крутилка 360°)</span>
        </label>
        <span className="font-mono text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
          {angle}°
        </span>
      </div>

      <div className="flex items-center justify-center">
        {/* Interactive 360 Dial */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className="relative select-none cursor-pointer touch-none"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer Track Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="#18181B"
              stroke="#3F3F46"
              strokeWidth="2"
            />

            {/* Subtle Compass tick marks */}
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
                  stroke={tick % 90 === 0 ? "#71717A" : "#52525B"}
                  strokeWidth={tick % 90 === 0 ? 1.5 : 1}
                />
              );
            })}

            {/* Light ray from sun to center */}
            <line
              x1={sunX}
              y1={sunY}
              x2={center}
              y2={center}
              stroke="rgba(251, 191, 36, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="2 3"
            />

            {/* Shadow projection ray from center to shadow direction */}
            <line
              x1={center}
              y1={center}
              x2={shadowX}
              y2={shadowY}
              stroke="rgba(161, 161, 170, 0.7)"
              strokeWidth="2.5"
            />
            {/* Shadow indicator tip */}
            <circle cx={shadowX} cy={shadowY} r="3" fill="#A1A1AA" />

            {/* Center object (Widget simulation) */}
            <rect
              x={center - 11}
              y={center - 11}
              width="22"
              height="22"
              rx="4"
              fill="#27272A"
              stroke="#71717A"
              strokeWidth="1.2"
            />
            <text
              x={center}
              y={center + 3.5}
              textAnchor="middle"
              fill="#D4D4D8"
              fontSize="8"
              fontWeight="bold"
            >
              3D
            </text>

            {/* Orbiting Sun Handle */}
            <g transform={`translate(${sunX}, ${sunY})`}>
              {/* Sun Glow */}
              <circle cx="0" cy="0" r="13" fill="#F59E0B" opacity="0.25" />
              {/* Sun Body */}
              <circle cx="0" cy="0" r="8.5" fill="#FBBF24" stroke="#FFF" strokeWidth="1.5" />
              {/* Sun mini rays */}
              <path
                d="M-5 0 h-2 M5 0 h2 M0 -5 v-2 M0 5 v2"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Direction readout */}
      <div className="text-center">
        <span className="text-[11px] text-neutral-400">
          Світло: <strong className="text-neutral-200">{getDirectionName(angle)}</strong>
        </span>
      </div>

      {/* Quick Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button
          onClick={() => onChange(315)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            angle === 315
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
          title="Верхнє-ліве світло (як на еталонному фото)"
        >
          ☀️ Студія (315°)
        </button>
        <button
          onClick={() => onChange(0)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            angle === 0
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
        >
          Зверху (0°)
        </button>
        <button
          onClick={() => onChange(45)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            angle === 45
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
        >
          Праворуч (45°)
        </button>
        <button
          onClick={() => onChange(270)}
          className={`py-1 px-1.5 text-[10px] rounded border transition font-medium ${
            angle === 270
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-neutral-800 border-neutral-700/70 text-neutral-400 hover:text-white'
          }`}
        >
          Зліва (270°)
        </button>
      </div>
    </div>
  );
};
