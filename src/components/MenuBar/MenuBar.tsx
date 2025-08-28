import React from 'react';
import { X, Minus } from 'lucide-react';

export const MenuBar: React.FC = () => {
  const handleMinimize = async () => {
    try {
      await window.electronAPI.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleClose = async () => {
    try {
      await window.electronAPI.quit();
    } catch (error) {
      console.error('Failed to close application:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-sm border-b border-slate-600/30">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Draggable title area */}
        <div className="flex-1 draggable-region cursor-move">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <h1 className="text-white font-semibold text-sm">
              Interview Coder
            </h1>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
              Unlocked Edition
            </span>
          </div>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={handleMinimize}
            className="p-1.5 hover:bg-slate-600/50 rounded transition-colors group"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-slate-300 group-hover:text-white" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-red-500/50 rounded transition-colors group"
            title="Close"
          >
            <X className="w-4 h-4 text-slate-300 group-hover:text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
