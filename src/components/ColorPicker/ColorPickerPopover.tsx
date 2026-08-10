import React, { useRef, useEffect } from 'react';
import { COLOR_PALETTE } from '../../utils/colors';
import { Check } from 'lucide-react';

interface ColorPickerPopoverProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  currentColor,
  onSelectColor,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="color-picker-popover"
      role="dialog"
      aria-label="Color Palette"
    >
      <div className="color-picker-header">
        <span className="color-picker-title">Select Color</span>
      </div>
      <div className="color-grid">
        {COLOR_PALETTE.map((item) => {
          const isSelected = currentColor.toLowerCase() === item.value.toLowerCase();
          return (
            <button
              key={item.id}
              type="button"
              className={`color-swatch-btn ${isSelected ? 'active' : ''}`}
              style={{ backgroundColor: item.value }}
              title={item.name}
              onClick={() => {
                onSelectColor(item.value);
                onClose();
              }}
            >
              {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <div className="custom-color-row">
        <label htmlFor="custom-color-input" className="custom-color-label">
          Custom
        </label>
        <div className="custom-color-input-wrapper">
          <input
            id="custom-color-input"
            type="color"
            value={currentColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className="custom-color-input"
          />
          <span className="custom-color-hex">{currentColor.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
