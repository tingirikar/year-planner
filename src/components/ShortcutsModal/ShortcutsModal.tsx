import React from 'react';
import { X, Command, Move, MousePointer, Layers, ArrowLeftRight, Trash2 } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'Timeline Interactions',
      items: [
        { key: 'Drag Bar', desc: 'Move start/end dates smoothly along the timeline or between lanes' },
        { key: 'Drag Ends', desc: 'Stretch / resize duration from left or right edge' },
        { key: 'Drag Canvas', desc: 'Click & drag on empty canvas to draw a new goal bar instantly' },
        { key: 'Alt + Drag Canvas', desc: 'Draw marquee box to multi-select goals' },
      ],
    },
    {
      category: 'Selection & Editing',
      items: [
        { key: 'Shift + Click', desc: 'Add / remove goal from current multi-selection' },
        { key: 'Double Click', desc: 'Inline edit goal title directly on the bar' },
        { key: 'Ctrl + A', desc: 'Select all goals in current year' },
        { key: 'Ctrl + D', desc: 'Duplicate selected goal' },
        { key: 'Delete / Backspace', desc: 'Delete selected goal(s)' },
        { key: 'Escape', desc: 'Clear selection' },
      ],
    },
    {
      category: 'History & Organization',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo last change' },
        { key: 'Ctrl + Y / Ctrl+Shift+Z', desc: 'Redo previously undone change' },
        { key: 'Drag Row Handle', desc: 'Reorder goals in list and synchronize lanes' },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortcuts-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">Keyboard & Gesture Shortcuts</h2>
            <span className="modal-subtitle">Figma-like fast navigation and editing</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          {shortcuts.map((group) => (
            <div key={group.category} className="shortcut-group">
              <h3 className="shortcut-group-title">{group.category}</h3>
              <div className="shortcut-items-grid">
                {group.items.map((item) => (
                  <div key={item.key} className="shortcut-item">
                    <kbd className="shortcut-key-badge">{item.key}</kbd>
                    <span className="shortcut-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
