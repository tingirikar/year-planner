import React, { useState } from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { FeatureListItem } from './FeatureListItem';
import { Plus, Sparkles } from 'lucide-react';

export const FeatureList: React.FC = () => {
  const {
    features,
    addFeature,
    reorderFeatures,
    resetToDefaults,
  } = usePlanner();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderFeatures(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleAddGoalClick = () => {
    addFeature({
      title: 'New Goal',
    });
  };

  return (
    <div className="features-list-section">
      <div className="features-list-header">
        <div className="features-title-group">
          <h2 className="features-heading">Goals</h2>
          <span className="features-count-badge">{features.length}</span>
        </div>

        <div className="features-header-actions">
          <button
            type="button"
            className="primary-action-btn add-goal-btn"
            onClick={handleAddGoalClick}
            title="Add a new goal to the roadmap"
          >
            <Plus size={16} />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      <div className="features-list-container">
        {features.map((feature, idx) => (
          <FeatureListItem
            key={feature.id}
            feature={feature}
            index={idx}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        {features.length === 0 && (
          <div className="empty-features-state">
            <p>No goals planned for this year yet.</p>
            <div className="empty-state-actions">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={resetToDefaults}
              >
                <Sparkles size={14} />
                <span>Load Sample Goals</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
