import React, { useState } from 'react';
import {
  X,
  Camera,
  Code,
  Eye,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { LanguageSelector } from '../shared/LanguageSelector';
import { useToast } from '../../contexts/toast';

interface ActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

export const ActionsDialog: React.FC<ActionsProps> = ({
  open,
  onOpenChange,
  currentLanguage,
  setLanguage,
}) => {
  if (!open) return null;

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { showToast } = useToast();

  const handleAction = async (actionType: string) => {
    try {
      switch (actionType) {
        case 'screenshot': {
          const result = await window.electronAPI.triggerScreenshot();
          if (!result.success) {
            showToast('Error', result.error || 'Failed to take screenshot', 'error');
          }
          break;
        }
        case 'solve': {
          const result = await window.electronAPI.triggerProcessScreenshots();
          if (!result.success) {
            showToast('Error', result.error || 'Failed to process screenshots', 'error');
          }
          break;
        }
        case 'delete-last': {
          const result = await window.electronAPI.deleteLastScreenshot();
          if (!result.success) {
            console.error("Failed to delete last screenshot:", result.error);
            showToast('Error', result.error || 'Failed to delete last screenshot', 'error');
          }
          break;
        }
        case 'hide-window': {
          const result = await window.electronAPI.toggleMainWindow();
          if (!result.success) {
            showToast('Error', result.error || 'Failed to toggle window', 'error');
          }
          break;
        }
        case 'reset': {
          const result = await window.electronAPI.triggerReset();
          if (!result.success) {
            showToast('Error', result.error || 'Failed to reset', 'error');
          }
          break;
        }
        case 'language-selection':
          setShowLanguageSelector(!showLanguageSelector);
          break;
        default:
          console.log(`Action not implemented: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error executing action ${actionType}:`, error);
      showToast('Error', `Failed to execute ${actionType}`, 'error');
    }
  };

  const actionItems = [
    {
      title: 'Screenshot Actions',
      items: [
        {
          icon: <Camera className="w-5 h-5" />,
          name: 'Take Screenshot',
          description: 'Capture current screen',
          shortcut: 'Ctrl+H',
          action: 'screenshot',
        },
        {
          icon: <Code className="w-5 h-5" />,
          name: 'Solve Problem',
          description: 'Process screenshots and solve coding problems',
          shortcut: 'Ctrl+Enter',
          action: 'solve',
        },
        {
          icon: <Trash2 className="w-5 h-5" />,
          name: 'Delete Last Screenshot',
          description: 'Remove the most recent screenshot',
          shortcut: 'Ctrl+L',
          action: 'delete-last',
        },
      ],
    },
    {
      title: 'Application Settings',
      items: [
        {
          icon: <Code className="w-5 h-5" />,
          name: 'Programming Language Selection',
          description: `Choose preferred programming language (Current: ${currentLanguage})`,
          action: 'language-selection',
        },
      ],
    },
    {
      title: 'Window Controls',
      items: [
        {
          icon: <Eye className="w-5 h-5" />,
          name: 'Hide Window',
          description: 'Toggle window visibility',
          shortcut: 'Ctrl+B',
          action: 'hide-window',
        },
      ],
    },
    {
      title: 'Reset Options',
      items: [
        {
          icon: <RotateCcw className="w-5 h-5" />,
          name: 'Reset All',
          description: 'Cancel requests and reset all queues',
          shortcut: 'Ctrl+R',
          action: 'reset',
        },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Actions & Settings
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {actionItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">
                  {category.title}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div
                        className={`flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg transition-colors ${
                          'action' in item && item.action
                            ? 'hover:bg-slate-700/70 cursor-pointer'
                            : 'hover:bg-slate-700/60'
                        }`}
                        onClick={() =>
                          'action' in item &&
                          item.action &&
                          handleAction(item.action)
                        }
                      >
                        <div className="flex-shrink-0 text-blue-400 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">
                              {item.name}
                            </h4>
                            {'shortcut' in item && item.shortcut && (
                              <span className="text-xs font-mono bg-slate-600 px-2 py-1 rounded text-slate-300">
                                {item.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Language Selector - shown when Programming Language Selection is clicked */}
                      {showLanguageSelector && item.name === 'Programming Language Selection' && (
                        <div className="mt-2 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-300 mb-3">
                            Select Programming Language:
                          </h4>
                          <LanguageSelector
                            currentLanguage={currentLanguage}
                            setLanguage={setLanguage}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-slate-700">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
