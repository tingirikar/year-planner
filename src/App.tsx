import React, { useState, useRef } from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { Header } from './components/Header/Header';
import { TimelineCanvas } from './components/Timeline/TimelineCanvas';
import { FeatureList } from './components/FeatureList/FeatureList';
import { ExportModal } from './components/ExportModal/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal/ShortcutsModal';

const PlannerMain: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="app-layout">
      {/* Top Application Header */}
      <Header
        onOpenExport={() => setShowExportModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
      />

      {/* Main Content Workspace */}
      <main className="planner-workspace">
        <div className="planner-canvas-wrapper" ref={timelineContainerRef}>
          {/* Main Card replicating the user's reference mockup */}
          <div className="main-planner-card">
            {/* Top Interactive Timeline Area */}
            <TimelineCanvas />

            {/* Subtle Divider Line */}
            <div className="card-divider" />

            {/* Bottom Synchronized Features List Area */}
            <FeatureList />
          </div>
        </div>
      </main>

      {/* Export & Import Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          timelineContainerRef={timelineContainerRef}
        />
      )}

      {/* Shortcuts Guide Modal */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <PlannerProvider>
      <PlannerMain />
    </PlannerProvider>
  );
}
