import React, { useState } from 'react';
import { Settings, Home, Keyboard, Zap } from 'lucide-react';
import { SettingsDialog } from '../Settings/SettingsDialog';
import { ShortcutsDialog } from '../Shortcuts/ShortcutsDialog';
import { ActionsDialog } from '../Actions/ActionsDialog';

interface SidebarProps {
  currentView: 'main' | 'settings';
  onViewChange: (view: 'main' | 'settings') => void;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentLanguage,
  setLanguage,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleShortcutsClick = () => {
    setIsShortcutsOpen(true);
  };

  const handleActionsClick = () => {
    setIsActionsOpen(true);
  };

  const handleCloseSettings = (open: boolean) => {
    setIsSettingsOpen(false);
  };

  const handleCloseShortcuts = (open: boolean) => {
    setIsShortcutsOpen(false);
  };

  const handleCloseActions = (open: boolean) => {
    setIsActionsOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/90 backdrop-blur-sm border-r border-slate-600/30 flex-shrink-0 no-flicker">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-600/30">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🚀</span>
              Interview Coder
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              AI-Powered Problem Solver
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 p-4 space-y-2">
            {/* Main Tab */}
            <button
              onClick={() => onViewChange('main')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                currentView === 'main'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Main</span>
            </button>

            {/* Actions Tab */}
            <button
              onClick={handleActionsClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              <Zap className="w-5 h-5" />
              <span className="font-medium">Actions</span>
            </button>

            {/* Settings Tab */}
            <button
              onClick={handleSettingsClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                currentView === 'settings'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>

            {/* Shortcuts Tab */}
            <button
              onClick={handleShortcutsClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              <Keyboard className="w-5 h-5" />
              <span className="font-medium">Shortcuts</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-600/30">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-2">Version 1.0.0</div>
              <div className="text-xs text-slate-500">Unlocked Edition</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Dialog */}
      <ActionsDialog
        open={isActionsOpen}
        onOpenChange={handleCloseActions}
        currentLanguage={currentLanguage}
        setLanguage={setLanguage}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={handleCloseSettings}
      />

      {/* Shortcuts Dialog */}
      <ShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={handleCloseShortcuts}
      />
    </>
  );
};
