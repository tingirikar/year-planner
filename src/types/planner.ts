export interface DateRange {
  startDate: string; // ISO date string 'YYYY-MM-DD'
  endDate: string;   // ISO date string 'YYYY-MM-DD'
}

export interface FeatureItem {
  id: string;
  title: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  color: string;     // Hex color code or gradient token
  lane: number;      // 0-indexed vertical lane / row in timeline
  category?: string;
  description?: string;
  progress?: number; // 0 - 100
  pinned?: boolean;
}

export type SnapMode = 'day' | 'week' | 'half-month' | 'month' | 'none';

export type ViewLayout = 'waterfall' | 'compact' | 'lanes';

export interface PlannerSettings {
  year: number;
  snapMode: SnapMode;
  showTodayLine: boolean;
  showMonthGrid: boolean;
  showQuarterDividers: boolean;
  showSubTicks: boolean;
  showDurations: boolean;
  zoomLevel: number; // 1.0 = standard, 0.7 to 2.0
  panOffset: number; // horizontal pan offset
}

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  color: string;
  icon?: string;
}

export interface FeatureDragSnapshot {
  id: string;
  startDay: number;
  endDay: number;
  durationDays: number;
  lane: number;
}

export interface DragState {
  type: 'move' | 'resize-start' | 'resize-end' | 'create' | 'pan';
  featureId?: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  snapshots?: Record<string, FeatureDragSnapshot>;
  createdStartDate?: string;
  createdEndDate?: string;
  createdLane?: number;
}
