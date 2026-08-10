import React, { useState, useRef } from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { toPng } from 'html-to-image';
import { X, Image, FileJson, Upload, Check, Copy, AlertCircle } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
  timelineContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, timelineContainerRef }) => {
  const { year, exportJSON, importJSON } = usePlanner();
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPNG = async () => {
    const mainCard = document.querySelector('.main-planner-card') as HTMLElement;
    if (!mainCard) return;

    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(mainCard, {
        quality: 0.95,
        pixelRatio: 2, // High DPI
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `Year-Planner-${year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `year-planner-roadmap-${year}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const jsonStr = exportJSON();
    navigator.clipboard.writeText(jsonStr);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importJSON(content);
      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Export & Backup Roadmap</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Export PNG Section */}
          <div className="export-card">
            <div className="export-card-icon">
              <Image size={24} className="text-blue-500" />
            </div>
            <div className="export-card-info">
              <h3 className="export-card-title">High-Resolution Image (PNG)</h3>
              <p className="export-card-desc">
                Export your full visual year timeline and feature list as a crisp 2x image ready for presentations and Figma.
              </p>
            </div>
            <button
              type="button"
              className="primary-btn export-btn"
              onClick={handleExportPNG}
              disabled={isExportingImage}
            >
              {isExportingImage ? 'Generating PNG...' : 'Download PNG'}
            </button>
          </div>

          {/* Export JSON Section */}
          <div className="export-card">
            <div className="export-card-icon">
              <FileJson size={24} className="text-purple-500" />
            </div>
            <div className="export-card-info">
              <h3 className="export-card-title">Export Data (JSON)</h3>
              <p className="export-card-desc">
                Save your roadmap structure, dates, and colors for backups or sharing across devices.
              </p>
            </div>
            <div className="export-action-group">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCopyJSON}
                title="Copy JSON to clipboard"
              >
                {copiedJSON ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedJSON ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                className="primary-btn export-btn"
                onClick={handleDownloadJSON}
              >
                Download JSON
              </button>
            </div>
          </div>

          {/* Import JSON Section */}
          <div className="export-card">
            <div className="export-card-icon">
              <Upload size={24} className="text-emerald-500" />
            </div>
            <div className="export-card-info">
              <h3 className="export-card-title">Restore / Import Data</h3>
              <p className="export-card-desc">
                Load a previously exported JSON file to restore your entire year plan.
              </p>
            </div>
            <button
              type="button"
              className="secondary-btn export-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Import File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Import Status Feedback */}
          {importStatus === 'success' && (
            <div className="status-toast status-success">
              <Check size={16} />
              <span>Roadmap imported successfully!</span>
            </div>
          )}
          {importStatus === 'error' && (
            <div className="status-toast status-error">
              <AlertCircle size={16} />
              <span>Invalid JSON file format. Please try another file.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
