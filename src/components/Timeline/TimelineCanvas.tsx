import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { MonthHeader } from './MonthHeader';
import { FeatureBlock } from './FeatureBlock';
import {
  getMonthColumns,
  getDaysInYear,
  dateToDayOfYear,
  dayOfYearToDate,
  dateToFraction,
  fractionToDate,
  getTodayFraction,
  formatDateRange,
  getDurationDays,
} from '../../utils/dateUtils';
import { FeatureItem, DragState, SelectionBox, FeatureDragSnapshot } from '../../types/planner';
import { getColorByIndex } from '../../utils/colors';

export const LANE_HEIGHT = 38;
export const LANE_GAP = 12;
export const TIMELINE_PADDING_TOP = 14;
export const TIMELINE_PADDING_BOTTOM = 16;
export const TOTAL_LANES = 5;

export const TimelineCanvas: React.FC = () => {
  const {
    year,
    features,
    settings,
    selectedIds,
    hoveredId,
    selectFeature,
    setSelectedIds,
    clearSelection,
    addFeature,
    updateFeature,
    batchUpdateFeatures,
  } = usePlanner();

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Keep timeline compact: exactly 5 lanes (matching the reference UI)
  const totalLanes = TOTAL_LANES;
  const totalBoardHeight = TIMELINE_PADDING_TOP + totalLanes * (LANE_HEIGHT + LANE_GAP) + TIMELINE_PADDING_BOTTOM;

  // Active interaction drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<SelectionBox | null>(null);
  const [creatingPreview, setCreatingPreview] = useState<{
    startDate: string;
    endDate: string;
    lane: number;
    color: string;
  } | null>(null);

  const months = getMonthColumns(year);
  const todayInfo = getTodayFraction(year);

  // Ref to hold current dragState for event listeners without stale closures
  const dragStateRef = useRef<DragState | null>(null);
  dragStateRef.current = dragState;

  const featuresRef = useRef<FeatureItem[]>(features);
  featuresRef.current = features;

  const selectedIdsRef = useRef<string[]>(selectedIds);
  selectedIdsRef.current = selectedIds;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Helper to convert screen X coordinate into normalized [0, 1] fraction within the timeline
  const getTimelineFractionFromClientX = useCallback(
    (clientX: number): number => {
      if (!boardRef.current) return 0;
      const rect = boardRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      return Math.max(0, Math.min(1, relativeX / rect.width));
    },
    []
  );

  // Helper to convert screen Y coordinate into lane index (clamped to 0..4)
  const getLaneFromClientY = useCallback((clientY: number): number => {
    if (!boardRef.current) return 0;
    const rect = boardRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top - TIMELINE_PADDING_TOP;
    const laneIndex = Math.floor(relativeY / (LANE_HEIGHT + LANE_GAP));
    return Math.max(0, Math.min(TOTAL_LANES - 1, laneIndex));
  }, []);

  // Start dragging a feature block (move, resize-start, resize-end)
  const handleStartDrag = useCallback(
    (
      e: React.PointerEvent,
      type: 'move' | 'resize-start' | 'resize-end',
      featureId: string
    ) => {
      e.stopPropagation();

      const currentFeatures = featuresRef.current;
      const currentSelectedIds = selectedIdsRef.current;
      const feature = currentFeatures.find((f) => f.id === featureId);
      if (!feature) return;

      // Update selection: if not holding Shift and not in selection, select only this
      let activeIds = currentSelectedIds;
      if (!e.shiftKey && !currentSelectedIds.includes(featureId)) {
        selectFeature(featureId, false);
        activeIds = [featureId];
      } else if (e.shiftKey) {
        selectFeature(featureId, true);
        activeIds = currentSelectedIds.includes(featureId)
          ? currentSelectedIds
          : [...currentSelectedIds, featureId];
      }

      // Snapshot all active features' initial positions
      const snapshots: Record<string, FeatureDragSnapshot> = {};
      const targetIds = type === 'move' ? activeIds : [featureId];

      targetIds.forEach((id) => {
        const feat = currentFeatures.find((f) => f.id === id);
        if (feat) {
          const startDay = dateToDayOfYear(feat.startDate, year);
          const endDay = dateToDayOfYear(feat.endDate, year);
          snapshots[id] = {
            id,
            startDay,
            endDay,
            durationDays: Math.max(0, endDay - startDay),
            lane: feat.lane,
          };
        }
      });

      const nextDragState: DragState = {
        type,
        featureId,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        snapshots,
      };

      setDragState(nextDragState);
    },
    [year, selectFeature]
  );

  // Board pointer down (canvas click, marquee start, or click-to-draw feature)
  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button

    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.feature-block-pill, .resize-handle, button, input');
    if (isInteractive) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    // Start Windows/Figma-style blue marquee selection box on canvas drag
    const startX = e.clientX - boardRect.left;
    const startY = e.clientY - boardRect.top;

    setMarqueeBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      active: true,
    });

    if (!e.shiftKey) {
      clearSelection();
    }
  };

  // Global Pointer Move & Up Handlers
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // 1. Handling Marquee selection box
      if (marqueeBox?.active && boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const currentX = e.clientX - boardRect.left;
        const currentY = e.clientY - boardRect.top;
        setMarqueeBox((prev) => (prev ? { ...prev, currentX, currentY } : null));

        const boxLeft = Math.min(marqueeBox.startX, currentX);
        const boxRight = Math.max(marqueeBox.startX, currentX);
        const boxTop = Math.min(marqueeBox.startY, currentY);
        const boxBottom = Math.max(marqueeBox.startY, currentY);

        const totalDays = getDaysInYear(year);
        const newlySelected: string[] = [];

        featuresRef.current.forEach((feat) => {
          const sDay = dateToDayOfYear(feat.startDate, year);
          const eDay = dateToDayOfYear(feat.endDate, year);
          const featLeft = (sDay / totalDays) * boardRect.width;
          const featRight = ((eDay + 1) / totalDays) * boardRect.width;
          const featTop = TIMELINE_PADDING_TOP + feat.lane * (LANE_HEIGHT + LANE_GAP);
          const featBottom = featTop + LANE_HEIGHT;

          const intersects =
            featLeft < boxRight &&
            featRight > boxLeft &&
            featTop < boxBottom &&
            featBottom > boxTop;

          if (intersects) {
            newlySelected.push(feat.id);
          }
        });

        setSelectedIds(newlySelected);
        return;
      }

      // 2. Handling Feature Drag State
      const currentDrag = dragStateRef.current;
      if (!currentDrag || !boardRef.current) return;

      const boardRect = boardRef.current.getBoundingClientRect();
      const totalDays = getDaysInYear(year);
      const currentSnapMode = settingsRef.current.snapMode;

      if (currentDrag.type === 'move' && currentDrag.snapshots) {
        // Delta in pixels from drag start
        const deltaPx = e.clientX - currentDrag.startX;
        const deltaDays = Math.round((deltaPx / boardRect.width) * totalDays);

        const deltaY = e.clientY - currentDrag.startY;
        const deltaLane = Math.floor((deltaY + (LANE_HEIGHT + LANE_GAP) / 2) / (LANE_HEIGHT + LANE_GAP));

        const updates: { id: string; changes: Partial<FeatureItem> }[] = [];

        Object.values(currentDrag.snapshots).forEach((snap) => {
          let newStartDay = snap.startDay + deltaDays;
          let newEndDay = newStartDay + snap.durationDays;

          // Clamping to year boundary
          if (newStartDay < 0) {
            newStartDay = 0;
            newEndDay = snap.durationDays;
          }
          if (newEndDay >= totalDays) {
            newEndDay = totalDays - 1;
            newStartDay = Math.max(0, newEndDay - snap.durationDays);
          }

          let newStartDate = dayOfYearToDate(newStartDay, year);
          let newEndDate = dayOfYearToDate(newEndDay, year);

          // Apply snapping if selected
          if (currentSnapMode !== 'none' && currentSnapMode !== 'day') {
            const startFrac = newStartDay / totalDays;
            newStartDate = fractionToDate(startFrac, year, currentSnapMode);
            const snappedStartDay = dateToDayOfYear(newStartDate, year);
            const snappedEndDay = Math.min(totalDays - 1, snappedStartDay + snap.durationDays);
            newEndDate = dayOfYearToDate(snappedEndDay, year);
          }

          const maxAllowedLane = Math.max(5, features.length - 1);
          const newLane = Math.max(0, Math.min(maxAllowedLane, snap.lane + deltaLane));

          updates.push({
            id: snap.id,
            changes: {
              startDate: newStartDate,
              endDate: newEndDate,
              lane: newLane,
            },
          });
        });

        if (updates.length > 0) {
          batchUpdateFeatures(updates, false);
        }
      } else if (currentDrag.type === 'resize-start' && currentDrag.snapshots && currentDrag.featureId) {
        const snap = currentDrag.snapshots[currentDrag.featureId];
        if (!snap) return;

        const currentFraction = Math.max(0, Math.min(1, (e.clientX - boardRect.left) / boardRect.width));
        const snappedDate = fractionToDate(currentFraction, year, currentSnapMode);
        const snappedDay = dateToDayOfYear(snappedDate, year);

        if (snappedDay <= snap.endDay) {
          updateFeature(snap.id, { startDate: snappedDate }, false);
        }
      } else if (currentDrag.type === 'resize-end' && currentDrag.snapshots && currentDrag.featureId) {
        const snap = currentDrag.snapshots[currentDrag.featureId];
        if (!snap) return;

        const currentFraction = Math.max(0, Math.min(1, (e.clientX - boardRect.left) / boardRect.width));
        const snappedDate = fractionToDate(currentFraction, year, currentSnapMode);
        const snappedDay = dateToDayOfYear(snappedDate, year);

        if (snappedDay >= snap.startDay) {
          updateFeature(snap.id, { endDate: snappedDate }, false);
        }
      } else if (currentDrag.type === 'create') {
        const currentFraction = Math.max(0, Math.min(1, (e.clientX - boardRect.left) / boardRect.width));
        const snappedCurrentDate = fractionToDate(currentFraction, year, currentSnapMode);
        const start = currentDrag.createdStartDate || snappedCurrentDate;
        const currentLane = getLaneFromClientY(e.clientY);

        const startDate = start <= snappedCurrentDate ? start : snappedCurrentDate;
        const endDate = start <= snappedCurrentDate ? snappedCurrentDate : start;

        setCreatingPreview((prev) =>
          prev
            ? {
                ...prev,
                startDate,
                endDate,
                lane: currentLane,
              }
            : null
        );
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (marqueeBox?.active) {
        setMarqueeBox(null);
      }

      const currentDrag = dragStateRef.current;
      if (currentDrag) {
        if (currentDrag.type === 'create' && creatingPreview) {
          const duration = getDurationDays(creatingPreview.startDate, creatingPreview.endDate, year);
          if (duration >= 1) {
            addFeature({
              title: 'New Goal',
              startDate: creatingPreview.startDate,
              endDate: creatingPreview.endDate,
              lane: creatingPreview.lane,
              color: creatingPreview.color,
            });
          }
          setCreatingPreview(null);
        }

        setDragState(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    year,
    marqueeBox,
    creatingPreview,
    getLaneFromClientY,
    batchUpdateFeatures,
    updateFeature,
    addFeature,
    setSelectedIds,
  ]);

  return (
    <div className="timeline-container" ref={containerRef}>
      {/* Top Fixed Month Header */}
      <MonthHeader />

      {/* Main Interactive Board */}
      <div
        className="timeline-board"
        ref={boardRef}
        style={{ height: `${totalBoardHeight}px` }}
        onPointerDown={handleBoardPointerDown}
      >
        {/* Background Vertical Month Columns and Grid Lines */}
        {settings.showMonthGrid && (
          <div className="grid-columns-container">
            {months.map((m) => (
              <div
                key={m.name}
                className={`grid-month-col ${m.index % 2 === 1 ? 'grid-month-alt' : ''}`}
                style={{
                  left: `${m.leftPercent}%`,
                  width: `${m.widthPercent}%`,
                }}
              >
                {/* 15th of the month subtle divider line */}
                <div className="grid-mid-line" />
              </div>
            ))}
          </div>
        )}

        {/* Lane Horizontal Guidelines */}
        <div className="grid-lanes-container">
          {Array.from({ length: totalLanes }).map((_, idx) => (
            <div
              key={idx}
              className="grid-lane-track"
              style={{
                top: `${TIMELINE_PADDING_TOP + idx * (LANE_HEIGHT + LANE_GAP)}px`,
                height: `${LANE_HEIGHT}px`,
              }}
            />
          ))}
        </div>

        {/* Today Marker Line */}
        {settings.showTodayLine && todayInfo.isThisYear && (
          <div
            className="today-line"
            style={{ left: `${todayInfo.fraction * 100}%` }}
          >
            <div className="today-badge">TODAY</div>
          </div>
        )}

        {/* Render Features */}
        <div className="features-layer">
          {features.map((feature) => (
            <FeatureBlock
              key={feature.id}
              feature={feature}
              containerWidth={boardRef.current?.clientWidth || 1000}
              isSelected={selectedIds.includes(feature.id)}
              isHovered={hoveredId === feature.id}
              onStartDrag={handleStartDrag}
            />
          ))}

          {/* Creation Preview Bar while user is drawing a new bar */}
          {creatingPreview && (
            <div
              className="feature-block-wrapper creating-preview"
              style={{
                left: `${dateToFraction(creatingPreview.startDate, year) * 100}%`,
                width: `${
                  (dateToFraction(creatingPreview.endDate, year) -
                    dateToFraction(creatingPreview.startDate, year) +
                    1 / getDaysInYear(year)) *
                  100
                }%`,
                top: `${TIMELINE_PADDING_TOP + creatingPreview.lane * (LANE_HEIGHT + LANE_GAP)}px`,
                height: `${LANE_HEIGHT}px`,
              }}
            >
              <div
                className="feature-block-pill"
                style={{ backgroundColor: creatingPreview.color, opacity: 0.85 }}
              >
                <div className="feature-block-content">
                  <span className="feature-block-title">New Goal</span>
                </div>
              </div>
              <div className="feature-tooltip">
                <span className="tooltip-dates">
                  {formatDateRange(creatingPreview.startDate, creatingPreview.endDate)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Marquee Selection Rectangle */}
        {marqueeBox?.active && (
          <div
            className="marquee-selection-box"
            style={{
              left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}px`,
              top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}px`,
              width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}px`,
              height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};
