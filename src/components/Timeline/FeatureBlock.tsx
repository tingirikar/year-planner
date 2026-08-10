import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FeatureItem } from '../../types/planner';
import { usePlanner } from '../../context/PlannerContext';
import {
  dateToFraction,
  fractionToDate,
  dateToDayOfYear,
  dayOfYearToDate,
  getDaysInYear,
  formatDateRange,
  getDurationDays,
  addDays,
} from '../../utils/dateUtils';
import { LANE_HEIGHT, LANE_GAP } from './TimelineCanvas';

interface FeatureBlockProps {
  feature: FeatureItem;
  containerWidth: number;
  isSelected: boolean;
  isHovered: boolean;
  onStartDrag: (
    e: React.PointerEvent,
    action: 'move' | 'resize-start' | 'resize-end',
    featureId: string
  ) => void;
}

export const FeatureBlock: React.FC<FeatureBlockProps> = ({
  feature,
  isSelected,
  isHovered,
  onStartDrag,
}) => {
  const { year, selectFeature, hoveredId, setHoveredId, updateFeature } = usePlanner();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(feature.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalDays = getDaysInYear(year);
  const startDay = dateToDayOfYear(feature.startDate, year);
  const endDay = dateToDayOfYear(feature.endDate, year);
  
  // Calculate left and width percentages
  const leftPercent = (startDay / totalDays) * 100;
  const daySpan = Math.max(1, endDay - startDay + 1);
  const widthPercent = (daySpan / totalDays) * 100;

  const topPx = feature.lane * (LANE_HEIGHT + LANE_GAP);
  const duration = getDurationDays(feature.startDate, feature.endDate, year);
  const dateRangeStr = formatDateRange(feature.startDate, feature.endDate);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== feature.title) {
      updateFeature(feature.id, { title: editedTitle.trim() });
    } else {
      setEditedTitle(feature.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(feature.title);
    }
  };

  return (
    <div
      className={`feature-block-wrapper ${isSelected ? 'selected' : ''} ${
        isHovered ? 'hovered' : ''
      }`}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${topPx}px`,
        height: `${LANE_HEIGHT}px`,
      }}
      onPointerEnter={() => setHoveredId(feature.id)}
      onPointerLeave={() => {
        if (hoveredId === feature.id) setHoveredId(null);
      }}
    >
      <div
        className="feature-block-pill"
        style={{
          backgroundColor: feature.color,
          boxShadow: isSelected
            ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${feature.color}, 0 8px 20px rgba(0, 0, 0, 0.15)`
            : '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
        onPointerDown={(e) => {
          if (isEditingTitle) return;
          onStartDrag(e, 'move', feature.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditingTitle(true);
        }}
      >
        {/* Left Resize Handle */}
        <div
          className="resize-handle resize-handle-start"
          title="Drag to adjust start date"
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartDrag(e, 'resize-start', feature.id);
          }}
        >
          <span className="resize-handle-indicator" />
        </div>

        {/* Content Area */}
        <div className="feature-block-content">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              className="feature-inline-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="feature-block-title" title={feature.title}>
              {feature.title}
            </span>
          )}
        </div>

        {/* Right Resize Handle */}
        <div
          className="resize-handle resize-handle-end"
          title="Drag to extend end date"
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartDrag(e, 'resize-end', feature.id);
          }}
        >
          <span className="resize-handle-indicator" />
        </div>
      </div>

      {/* Floating Tooltip during Hover or Drag */}
      {(isHovered || isSelected) && !isEditingTitle && (
        <div className="feature-tooltip">
          <span className="tooltip-title">{feature.title}</span>
          <span className="tooltip-dates">{dateRangeStr}</span>
          <span className="tooltip-duration">({duration} days)</span>
        </div>
      )}
    </div>
  );
};
