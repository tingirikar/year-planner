import React from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { SnapSelector } from './SnapSelector';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Undo2,
  Redo2,
  Download,
  HelpCircle,
  Trash2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, onOpenShortcuts }) => {
  const {
    year,
    setYear,
    settings,
    updateSettings,
    selectedIds,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToDefaults,
  } = usePlanner();

  const handlePrevYear = () => setYear(year - 1);
  const handleNextYear = () => setYear(year + 1);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-branding">
          <div className="brand-icon-box">
            <CalendarDays size={20} className="brand-icon" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Year Planner</h1>
            <span className="brand-subtitle">Visual Annual Roadmap</span>
          </div>
        </div>

        {/* Year Navigation Switcher */}
        <div className="year-selector-box">
          <button
            type="button"
            className="year-nav-btn"
            onClick={handlePrevYear}
            title="Previous Year"
            aria-label="Previous Year"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="current-year-display">{year}</span>
          <button
            type="button"
            className="year-nav-btn"
            onClick={handleNextYear}
            title="Next Year"
            aria-label="Next Year"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="header-right">
        {/* Auto-Saved Indicator */}
        <div className="auto-save-pill" title="All goals and dates are automatically saved to your browser">
          <span className="save-status-dot" />
          <span className="save-status-text">Saved</span>
        </div>

        {/* Custom Figma-Style Snap Selector */}
        <SnapSelector />

        {/* Undo / Redo */}
        <div className="history-button-group">
          <button
            type="button"
            className="tool-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Delete Selected (if any selected) */}
        {selectedIds.length > 0 && (
          <button
            type="button"
            className="tool-btn danger-btn"
            onClick={deleteSelected}
            title={`Delete ${selectedIds.length} selected (Backspace/Delete)`}
          >
            <Trash2 size={16} />
            <span className="btn-badge">{selectedIds.length}</span>
          </button>
        )}

        <div className="divider-vertical" />

        {/* Export & Share Modal */}
        <button
          type="button"
          className="tool-btn primary-action-btn"
          onClick={onOpenExport}
          title="Export as Image or Backup Data"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        {/* Keyboard Shortcuts Guide */}
        <button
          type="button"
          className="tool-btn icon-only"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle size={17} />
        </button>
      </div>
    </header>
  );
};
