import { FeatureItem, Milestone, PlannerSettings } from '../types/planner';

const STORAGE_KEY_PREFIX = 'year_planner_data_';
const SETTINGS_KEY = 'year_planner_settings';

export function getInitialFeatures(year: number): FeatureItem[] {
  return [
    {
      id: 'feat-1',
      title: 'Core Platform Refactor',
      startDate: `${year}-05-01`,
      endDate: `${year}-06-29`,
      color: '#3B82F6',
      lane: 0,
      category: 'Engineering',
      progress: 75,
    },
    {
      id: 'feat-2',
      title: 'Design System & Figma Sync',
      startDate: `${year}-06-01`,
      endDate: `${year}-07-30`,
      color: '#8B5CF6',
      lane: 1,
      category: 'Design',
      progress: 40,
    },
    {
      id: 'feat-3',
      title: 'AI Assistant Integration',
      startDate: `${year}-06-10`,
      endDate: `${year}-08-08`,
      color: '#EC4899',
      lane: 2,
      category: 'Product',
      progress: 60,
    },
    {
      id: 'feat-4',
      title: 'Mobile App Beta Launch',
      startDate: `${year}-06-17`,
      endDate: `${year}-08-15`,
      color: '#F59E0B',
      lane: 3,
      category: 'Mobile',
      progress: 25,
    },
    {
      id: 'feat-5',
      title: 'Enterprise Analytics Dashboard',
      startDate: `${year}-07-13`,
      endDate: `${year}-09-10`,
      color: '#10B981',
      lane: 4,
      category: 'Analytics',
      progress: 10,
    },
  ];
}

export function getInitialMilestones(year: number): Milestone[] {
  return [
    {
      id: 'ms-1',
      title: 'Q2 Strategy Review',
      date: `${year}-06-30`,
      color: '#8B5CF6',
    },
    {
      id: 'ms-2',
      title: 'Major v2.0 Release',
      date: `${year}-09-15`,
      color: '#EC4899',
    },
  ];
}

export const defaultSettings: PlannerSettings = {
  year: new Date().getFullYear(),
  snapMode: 'day',
  showTodayLine: true,
  showMonthGrid: true,
  showQuarterDividers: true,
  showSubTicks: true,
  showDurations: true,
  zoomLevel: 1.0,
  panOffset: 0,
};

export function loadSavedFeatures(year: number): FeatureItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}features_${year}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize any runaway lane numbers
        return parsed.map((item, idx) => ({
          ...item,
          lane: typeof item.lane === 'number' && item.lane >= 0 && item.lane < 6 ? item.lane : idx % 5,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load saved features', e);
  }
  return getInitialFeatures(year);
}

export function saveFeatures(year: number, features: FeatureItem[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}features_${year}`, JSON.stringify(features));
  } catch (e) {
    console.error('Failed to save features', e);
  }
}

export function loadSavedMilestones(year: number): Milestone[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}milestones_${year}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved milestones', e);
  }
  return getInitialMilestones(year);
}

export function saveMilestones(year: number, milestones: Milestone[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}milestones_${year}`, JSON.stringify(milestones));
  } catch (e) {
    console.error('Failed to save milestones', e);
  }
}

export function loadSavedSettings(): PlannerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load saved settings', e);
  }
  return defaultSettings;
}

export function saveSettings(settings: PlannerSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
