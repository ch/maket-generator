import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface HexColorPickerInputProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  className?: string;
}

/**
 * Normalizes any text or hex string to a valid 6-character hex `#RRGGBB`.
 */
export function normalizeHex(input: string): string | null {
  let hex = input.trim();
  if (hex.startsWith('#')) {
    hex = hex.substring(1);
  }

  // 3-digit shorthand (e.g. "fff" -> "ffffff")
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // 6-digit standard hex
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toUpperCase()}`;
  }

  // 8-digit hex with alpha (e.g. RRGGBBAA -> take first 6)
  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    return `#${hex.substring(0, 6).toUpperCase()}`;
  }

  return null;
}

export const HexColorPickerInput: React.FC<HexColorPickerInputProps> = ({
  value,
  onChange,
  label,
  className = '',
}) => {
  const [textValue, setTextValue] = useState(value || '#000000');
  const [copied, setCopied] = useState(false);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  // Sync external value changes into local text state
  useEffect(() => {
    if (value) {
      setTextValue(value.toUpperCase());
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nextText = e.target.value.trim();
    if (!nextText.startsWith('#') && nextText.length > 0) {
      nextText = '#' + nextText;
    }
    setTextValue(nextText);

    const validHex = normalizeHex(nextText);
    if (validHex) {
      onChange(validHex);
    }
  };

  const handleBlur = () => {
    const validHex = normalizeHex(textValue);
    if (validHex) {
      setTextValue(validHex);
      onChange(validHex);
    } else {
      // Revert to last valid prop value
      setTextValue(value ? value.toUpperCase() : '#000000');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    const validHex = normalizeHex(pasted);
    if (validHex) {
      setTextValue(validHex);
      onChange(validHex);
    } else {
      setTextValue(pasted);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setTextValue(hex);
    onChange(hex);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentHex = normalizeHex(textValue) || value;
    navigator.clipboard.writeText(currentHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentValidHex = normalizeHex(textValue) || (value.startsWith('#') ? value : '#000000');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Visual swatch + invisible native color picker on top */}
      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-600 shadow-inner group cursor-pointer">
        <div
          className="w-full h-full transition-transform group-hover:scale-110"
          style={{ backgroundColor: currentValidHex }}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={currentValidHex.length === 7 ? currentValidHex : '#000000'}
          onChange={handleNativeColorChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title={label || 'Вибрати колір'}
        />
      </div>

      {/* Editable HEX input field with Copy button */}
      <div className="flex items-center bg-neutral-900 border border-neutral-700/80 rounded-lg px-2 py-1 focus-within:border-indigo-500 transition-colors">
        <input
          type="text"
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder="#RRGGBB"
          maxLength={9}
          spellCheck={false}
          className="w-20 font-mono text-xs text-neutral-200 bg-transparent focus:outline-none uppercase tracking-wide"
          title="Введіть або вставте HEX-код кольору (наприклад: #E5E6E8)"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition ml-1"
          title="Скопіювати HEX в буфер обміну"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
};
