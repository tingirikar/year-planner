import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FeatureItem, Milestone, PlannerSettings, SnapMode } from '../types/planner';
import {
  loadSavedFeatures,
  saveFeatures,
  loadSavedMilestones,
  saveMilestones,
  loadSavedSettings,
  saveSettings,
  getInitialFeatures,
} from '../utils/storage';
import { getColorByIndex } from '../utils/colors';
import { addDays } from '../utils/dateUtils';

interface HistorySnapshot {
  features: FeatureItem[];
  milestones: Milestone[];
}

interface PlannerContextType {
  year: number;
  setYear: (year: number) => void;
  features: FeatureItem[];
  milestones: Milestone[];
  settings: PlannerSettings;
  selectedIds: string[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  
  // Selection
  selectFeature: (id: string, multi?: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // CRUD
  addFeature: (custom?: Partial<FeatureItem>) => string;
  updateFeature: (id: string, updates: Partial<FeatureItem>, recordHistory?: boolean) => void;
  batchUpdateFeatures: (updates: { id: string; changes: Partial<FeatureItem> }[], recordHistory?: boolean) => void;
  deleteFeature: (id: string) => void;
  deleteSelected: () => void;
  duplicateFeature: (id: string) => string | null;
  reorderFeatures: (sourceIndex: number, destinationIndex: number) => void;
  
  // Milestones
  addMilestone: (custom?: Partial<Milestone>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // Layout & Settings
  updateSettings: (updates: Partial<PlannerSettings>) => void;
  autoCompactLanes: () => void;
  resetToDefaults: () => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Import / Export
  exportJSON: () => string;
  importJSON: (data: string) => boolean;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<PlannerSettings>(loadSavedSettings);
  const [year, setYearState] = useState<number>(settings.year);
  const [features, setFeatures] = useState<FeatureItem[]>(() => loadSavedFeatures(settings.year));
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadSavedMilestones(settings.year));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);
  const isUndoRedoAction = useRef(false);

  // Sync year changes
  const setYear = useCallback((newYear: number) => {
    setYearState(newYear);
    setSettingsState((prev) => {
      const updated = { ...prev, year: newYear };
      saveSettings(updated);
      return updated;
    });
    setFeatures(loadSavedFeatures(newYear));
    setMilestones(loadSavedMilestones(newYear));
    setSelectedIds([]);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<PlannerSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  // Auto-save features & milestones whenever they change
  useEffect(() => {
    saveFeatures(year, features);
  }, [year, features]);

  useEffect(() => {
    saveMilestones(year, milestones);
  }, [year, milestones]);

  // Helper to push history snapshot
  const pushHistory = useCallback(() => {
    if (isUndoRedoAction.current) return;
    setUndoStack((prev) => [...prev.slice(-30), { features, milestones }]);
    setRedoStack([]);
  }, [features, milestones]);

  // Selection handlers
  const selectFeature = useCallback((id: string, multi = false) => {
    setSelectedIds((prev) => {
      if (multi) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(features.map((f) => f.id));
  }, [features]);

  // CRUD Operations
  const addFeature = useCallback((custom?: Partial<FeatureItem>): string => {
    pushHistory();
    const id = `feat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Find next available lane among 0..4 to keep timeline compact
    const usedLanes = new Set(features.map((f) => f.lane));
    let nextLane = 0;
    for (let l = 0; l < 5; l++) {
      if (!usedLanes.has(l)) {
        nextLane = l;
        break;
      }
      nextLane = (features.length) % 5;
    }
    
    const color = custom?.color || getColorByIndex(features.length);

    // Default start/end: e.g. next month or based on custom
    const defaultStart = custom?.startDate || `${year}-06-01`;
    const defaultEnd = custom?.endDate || addDays(defaultStart, 45, year);

    const newFeature: FeatureItem = {
      id,
      title: custom?.title || 'New Goal',
      startDate: defaultStart,
      endDate: defaultEnd,
      color,
      lane: custom?.lane !== undefined ? Math.min(4, Math.max(0, custom.lane)) : nextLane,
      category: custom?.category || 'General',
      progress: custom?.progress ?? 0,
      description: custom?.description || '',
    };

    setFeatures((prev) => [...prev, newFeature]);
    setSelectedIds([id]);
    return id;
  }, [features, year, pushHistory]);

  const updateFeature = useCallback((id: string, updates: Partial<FeatureItem>, recordHistory = true) => {
    if (recordHistory) {
      pushHistory();
    }
    setFeatures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, [pushHistory]);

  const batchUpdateFeatures = useCallback((updates: { id: string; changes: Partial<FeatureItem> }[], recordHistory = true) => {
    if (recordHistory) {
      pushHistory();
    }
    const updateMap = new Map(updates.map((u) => [u.id, u.changes]));
    setFeatures((prev) =>
      prev.map((item) => {
        const changes = updateMap.get(item.id);
        return changes ? { ...item, ...changes } : item;
      })
    );
  }, [pushHistory]);

  const deleteFeature = useCallback((id: string) => {
    pushHistory();
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushHistory();
    const toDelete = new Set(selectedIds);
    setFeatures((prev) => prev.filter((f) => !toDelete.has(f.id)));
    setSelectedIds([]);
  }, [selectedIds, pushHistory]);

  const duplicateFeature = useCallback((id: string): string | null => {
    const original = features.find((f) => f.id === id);
    if (!original) return null;
    pushHistory();
    const newId = `feat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const duplicate: FeatureItem = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      lane: original.lane + 1,
    };
    // Shift subsequent lanes
    setFeatures((prev) => {
      const shifted = prev.map((f) => (f.lane > original.lane ? { ...f, lane: f.lane + 1 } : f));
      return [...shifted, duplicate];
    });
    setSelectedIds([newId]);
    return newId;
  }, [features, pushHistory]);

  const reorderFeatures = useCallback((sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    pushHistory();
    setFeatures((prev) => {
      const items = [...prev];
      const [removed] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, removed);
      // Re-assign lane indexes to match list order
      return items.map((item, idx) => ({ ...item, lane: idx }));
    });
  }, [pushHistory]);

  // Milestone CRUD
  const addMilestone = useCallback((custom?: Partial<Milestone>) => {
    pushHistory();
    const id = `ms-${Date.now()}`;
    const newMs: Milestone = {
      id,
      title: custom?.title || 'Key Milestone',
      date: custom?.date || `${year}-06-15`,
      color: custom?.color || '#8B5CF6',
    };
    setMilestones((prev) => [...prev, newMs]);
  }, [year, pushHistory]);

  const updateMilestone = useCallback((id: string, updates: Partial<Milestone>) => {
    pushHistory();
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, [pushHistory]);

  const deleteMilestone = useCallback((id: string) => {
    pushHistory();
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, [pushHistory]);

  // Auto compact lanes (pack features into minimal lanes without overlap)
  const autoCompactLanes = useCallback(() => {
    pushHistory();
    setFeatures((prev) => {
      // Sort by start date
      const sorted = [...prev].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const laneEndDates: string[] = [];
      const updated: FeatureItem[] = [];

      for (const item of sorted) {
        let placedLane = -1;
        for (let l = 0; l < laneEndDates.length; l++) {
          if (laneEndDates[l] < item.startDate) {
            placedLane = l;
            laneEndDates[l] = item.endDate;
            break;
          }
        }
        if (placedLane === -1) {
          placedLane = laneEndDates.length;
          laneEndDates.push(item.endDate);
        }
        updated.push({ ...item, lane: placedLane });
      }
      return updated;
    });
  }, [pushHistory]);

  const resetToDefaults = useCallback(() => {
    pushHistory();
    const initial = getInitialFeatures(year);
    setFeatures(initial);
    setSelectedIds([]);
  }, [year, pushHistory]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    isUndoRedoAction.current = true;
    const lastSnapshot = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { features, milestones }]);
    setUndoStack((prev) => prev.slice(0, -1));
    setFeatures(lastSnapshot.features);
    setMilestones(lastSnapshot.milestones);
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 50);
  }, [undoStack, features, milestones]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    isUndoRedoAction.current = true;
    const nextSnapshot = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { features, milestones }]);
    setRedoStack((prev) => prev.slice(0, -1));
    setFeatures(nextSnapshot.features);
    setMilestones(nextSnapshot.milestones);
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 50);
  }, [redoStack, features, milestones]);

  // JSON export & import
  const exportJSON = useCallback(() => {
    return JSON.stringify(
      {
        year,
        features,
        milestones,
        settings,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }, [year, features, milestones, settings]);

  const importJSON = useCallback((raw: string): boolean => {
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.features)) {
        pushHistory();
        if (data.year && typeof data.year === 'number') {
          setYear(data.year);
        }
        setFeatures(data.features);
        if (Array.isArray(data.milestones)) {
          setMilestones(data.milestones);
        }
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }, [pushHistory, setYear]);

  // Keyboard shortcuts (Delete, Escape, Ctrl+Z, Ctrl+Y, Ctrl+A, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger global shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedIds.length === 1) {
        e.preventDefault();
        duplicateFeature(selectedIds[0]);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectAll, selectedIds, duplicateFeature, deleteSelected, clearSelection]);

  return (
    <PlannerContext.Provider
      value={{
        year,
        setYear,
        features,
        milestones,
        settings,
        selectedIds,
        hoveredId,
        setHoveredId,
        selectFeature,
        setSelectedIds,
        clearSelection,
        selectAll,
        addFeature,
        updateFeature,
        batchUpdateFeatures,
        deleteFeature,
        deleteSelected,
        duplicateFeature,
        reorderFeatures,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        updateSettings,
        autoCompactLanes,
        resetToDefaults,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
