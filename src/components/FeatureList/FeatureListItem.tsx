import React, { useState, useRef } from 'react';
import { FeatureItem } from '../../types/planner';
import { usePlanner } from '../../context/PlannerContext';
import { formatDateRange, getDurationDays } from '../../utils/dateUtils';
import { ColorPickerPopover } from '../ColorPicker/ColorPickerPopover';
import { Trash2, GripVertical, Calendar } from 'lucide-react';

interface FeatureListItemProps {
  feature: FeatureItem;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export const FeatureListItem: React.FC<FeatureListItemProps> = ({
  feature,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const {
    year,
    selectedIds,
    hoveredId,
    selectFeature,
    setHoveredId,
    updateFeature,
    deleteFeature,
  } = usePlanner();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localTitle, setLocalTitle] = useState(feature.title);
  const colorBtnRef = useRef<HTMLButtonElement>(null);

  const isSelected = selectedIds.includes(feature.id);
  const isHovered = hoveredId === feature.id;
  const dateRangeFormatted = formatDateRange(feature.startDate, feature.endDate);
  const duration = getDurationDays(feature.startDate, feature.endDate, year);

  const handleTitleBlur = () => {
    if (localTitle.trim() && localTitle !== feature.title) {
      updateFeature(feature.id, { title: localTitle.trim() });
    } else {
      setLocalTitle(feature.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      className={`feature-list-row ${isSelected ? 'row-selected' : ''} ${
        isHovered ? 'row-hovered' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onMouseEnter={() => setHoveredId(feature.id)}
      onMouseLeave={() => {
        if (hoveredId === feature.id) setHoveredId(null);
      }}
      onClick={(e) => {
        // If clicking on input or buttons, don't toggle selection
        const target = e.target as HTMLElement;
        if (target.closest('input, button, .color-picker-popover')) return;
        selectFeature(feature.id, e.shiftKey);
      }}
    >
      {/* Drag Reorder Handle */}
      <div className="row-drag-handle" title="Drag to reorder">
        <GripVertical size={16} className="drag-icon" />
      </div>

      {/* Color Swatch Button */}
      <div className="color-swatch-wrapper">
        <button
          ref={colorBtnRef}
          type="button"
          className="feature-color-indicator"
          style={{ backgroundColor: feature.color }}
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          title="Change color"
          aria-label="Change color"
        />

        {showColorPicker && (
          <ColorPickerPopover
            currentColor={feature.color}
            onSelectColor={(newColor) => updateFeature(feature.id, { color: newColor })}
            onClose={() => setShowColorPicker(false)}
          />
        )}
      </div>

      {/* Feature Title Input */}
      <div className="feature-title-cell">
        <input
          type="text"
          className="feature-title-input"
          value={localTitle}
          onChange={(e) => {
            setLocalTitle(e.target.value);
          }}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Goal title..."
        />
      </div>

      {/* Formatted Date Range & Duration Badge */}
      <div className="feature-date-badge" title={`${duration} days total`}>
        <Calendar size={13} className="date-icon" />
        <span>{dateRangeFormatted}</span>
      </div>

      {/* Delete Action Button */}
      <button
        type="button"
        className="feature-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          deleteFeature(feature.id);
        }}
        title="Delete goal"
        aria-label="Delete goal"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
