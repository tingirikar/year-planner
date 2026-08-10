import React, { useState, useRef, useEffect } from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { SnapMode } from '../../types/planner';
import { Magnet, ChevronDown, Check } from 'lucide-react';

interface SnapOption {
  value: SnapMode;
  label: string;
  desc: string;
}

const SNAP_OPTIONS: SnapOption[] = [
  { value: 'day', label: 'Day', desc: 'Exact day precision (Default)' },
  { value: 'week', label: 'Week', desc: '7-day weekly sprints' },
  { value: 'half-month', label: '15 Days', desc: '1st & 15th of month' },
  { value: 'month', label: 'Month', desc: 'Month boundaries' },
  { value: 'none', label: 'Free', desc: 'Smooth float (No snap)' },
];

export const SnapSelector: React.FC = () => {
  const { settings, updateSettings } = usePlanner();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SNAP_OPTIONS.find((o) => o.value === settings.snapMode) || SNAP_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (mode: SnapMode) => {
    updateSettings({ snapMode: mode });
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`custom-snap-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Magnet size={14} className="snap-btn-icon" />
        <span className="snap-btn-text">Snap: <strong>{currentOption.label}</strong></span>
        <ChevronDown size={14} className={`snap-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          <div className="dropdown-menu-header">Snapping Precision</div>
          {SNAP_OPTIONS.map((option) => {
            const isSelected = option.value === settings.snapMode;
            return (
              <button
                key={option.value}
                type="button"
                className={`dropdown-menu-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="item-text-group">
                  <span className="item-title">{option.label}</span>
                  <span className="item-desc">{option.desc}</span>
                </div>
                {isSelected && <Check size={15} className="item-check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
