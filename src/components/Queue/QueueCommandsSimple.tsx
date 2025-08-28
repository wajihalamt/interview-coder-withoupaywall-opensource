import React, { useState } from 'react';
import {
  Camera,
  Play,
  RotateCcw,
  Settings,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '../../contexts/toast';
import { LanguageSelector } from '../shared/LanguageSelector';
import { COMMAND_KEY } from '../../utils/platform';

interface QueueCommandsSimpleProps {
  screenshotCount?: number;
  credits: number;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

export const QueueCommandsSimple: React.FC<QueueCommandsSimpleProps> = ({
  screenshotCount = 0,
  credits,
  currentLanguage,
  setLanguage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleAction = async (
    actionName: string,
    actionFn: () => Promise<any>
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await actionFn();
      if (result && !result.success) {
        throw new Error(result.error || `Failed to ${actionName}`);
      }
    } catch (error) {
      console.error(`Error ${actionName}:`, error);
      showToast('Error', `Failed to ${actionName}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Primary Actions
        </h3>

        {/* Take Screenshot */}
        <button
          onClick={() =>
            handleAction('take screenshot', () =>
              window.electronAPI.triggerScreenshot()
            )
          }
          disabled={isProcessing}
          className="w-full flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Camera className="w-5 h-5 text-blue-300" />
          <div className="flex-1 text-left">
            <div className="text-white font-medium">Take Screenshot</div>
            <div className="text-blue-200 text-sm">
              Capture the problem you want to solve
            </div>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs font-mono">
              {COMMAND_KEY}+H
            </span>
          </div>
        </button>

        {/* Solve */}
        <button
          onClick={() =>
            handleAction('process screenshots', () =>
              window.electronAPI.triggerProcessScreenshots()
            )
          }
          disabled={isProcessing || screenshotCount === 0}
          className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
            screenshotCount > 0
              ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30'
              : 'bg-slate-600/20 border border-slate-600/30 opacity-50'
          } disabled:opacity-50`}
        >
          <Play
            className={`w-5 h-5 ${
              screenshotCount > 0 ? 'text-green-300' : 'text-slate-400'
            }`}
          />
          <div className="flex-1 text-left">
            <div className="text-white font-medium">
              {screenshotCount > 0
                ? 'Solve Problem'
                : 'Solve Problem (Need Screenshots)'}
            </div>
            <div
              className={`text-sm ${
                screenshotCount > 0 ? 'text-green-200' : 'text-slate-400'
              }`}
            >
              {screenshotCount > 0
                ? `Process ${screenshotCount} screenshot${
                    screenshotCount > 1 ? 's' : ''
                  } with AI`
                : 'Take screenshots first'}
            </div>
          </div>
          <div className="flex gap-1">
            <span
              className={`px-2 py-1 rounded text-xs font-mono ${
                screenshotCount > 0
                  ? 'bg-green-500/30 text-green-200'
                  : 'bg-slate-600/30 text-slate-400'
              }`}
            >
              {COMMAND_KEY}+↵
            </span>
          </div>
        </button>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Settings</h3>

        <div className="space-y-3">
          {/* Language */}
          <div className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Programming Language
            </label>
            <LanguageSelector
              currentLanguage={currentLanguage}
              setLanguage={setLanguage}
            />
          </div>

          {/* Credits Display */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Credits
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm font-bold">
                ∞ Unlimited
              </span>
            </div>
          </div>

          {/* API Settings */}
          <button
            onClick={() => window.electronAPI.openSettingsPortal()}
            className="w-full flex items-center gap-3 p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-orange-300" />
            <div className="flex-1 text-left">
              <div className="text-white font-medium">API Settings</div>
              <div className="text-orange-200 text-sm">
                Configure OpenAI API key
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Utility Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Utility</h3>

        <div className="grid grid-cols-1 gap-2">
          {/* Hide/Show */}
          <button
            onClick={() =>
              handleAction('toggle window', () =>
                window.electronAPI.toggleMainWindow()
              )
            }
            disabled={isProcessing}
            className="flex items-center gap-3 p-3 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-600/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <EyeOff className="w-4 h-4 text-slate-300" />
            <span className="text-sm text-slate-300">Hide Window</span>
            <span className="ml-auto px-2 py-1 bg-slate-600/30 text-slate-400 rounded text-xs font-mono">
              {COMMAND_KEY}+B
            </span>
          </button>

          {/* Reset */}
          <button
            onClick={() =>
              handleAction('reset', () => window.electronAPI.triggerReset())
            }
            disabled={isProcessing}
            className="flex items-center gap-3 p-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-orange-300" />
            <span className="text-sm text-orange-300">Reset All</span>
            <span className="ml-auto px-2 py-1 bg-orange-600/30 text-orange-400 rounded text-xs font-mono">
              {COMMAND_KEY}+R
            </span>
          </button>

          {/* Delete Last */}
          <button
            onClick={() =>
              handleAction('delete last screenshot', () =>
                window.electronAPI.deleteLastScreenshot()
              )
            }
            disabled={isProcessing || screenshotCount === 0}
            className="flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-300" />
            <span className="text-sm text-red-300">Delete Last</span>
            <span className="ml-auto px-2 py-1 bg-red-600/30 text-red-400 rounded text-xs font-mono">
              {COMMAND_KEY}+L
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
