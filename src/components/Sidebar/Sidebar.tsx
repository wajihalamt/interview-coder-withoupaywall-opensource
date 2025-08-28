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
      {/* Sidebar - Icon Only */}
      <div className="w-16 bg-slate-800/90 backdrop-blur-sm border-r border-slate-600/30 flex-shrink-0 no-flicker">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-slate-600/30 flex justify-center">
            <div className="text-2xl" title="Interview Coder - AI-Powered Problem Solver">
              🚀
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex-1 p-3 space-y-3">
            {/* Main Tab */}
            <button
              onClick={() => onViewChange('main')}
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                currentView === 'main'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
              title="Main"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Actions Tab */}
            <button
              onClick={handleActionsClick}
              className="w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white group"
              title="Actions"
            >
              <Zap className="w-5 h-5" />
            </button>

            {/* Settings Tab */}
            <button
              onClick={handleSettingsClick}
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                currentView === 'settings'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Shortcuts Tab */}
            <button
              onClick={handleShortcutsClick}
              className="w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white group"
              title="Shortcuts"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-600/30 flex justify-center">
            <div className="text-xs text-slate-500 writing-mode-vertical" title="Version 1.0.0 - Unlocked Edition">
              v1.0
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
