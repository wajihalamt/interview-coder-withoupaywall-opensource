import React from 'react';
import { X } from 'lucide-react';

interface ShortcutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShortcutsDialog: React.FC<ShortcutProps> = ({
  open,
  onOpenChange,
}) => {
  if (!open) return null;

  const handleShortcutAction = async (actionName: string, action: (() => Promise<unknown>) | (() => void) | undefined) => {
    try {
      console.log(`${actionName} button clicked`);
      if (action) {
        await action();
        console.log(`${actionName} executed successfully`);
      } else {
        console.log(`${actionName} - no action available`);
      }
    } catch (error) {
      console.error(`Error executing ${actionName}:`, error);
    }
  };

  const shortcutCategories = {
    'Core Actions': [
      { 
        key: 'Ctrl+H', 
        description: 'Take a screenshot',
        action: () => window.electronAPI?.triggerScreenshot?.(),
        bgColor: 'bg-blue-600/20 hover:bg-blue-500/30 border-blue-500/30'
      },
      { 
        key: 'Ctrl+Enter', 
        description: 'Process screenshots',
        action: () => window.electronAPI?.triggerProcessScreenshots?.(),
        bgColor: 'bg-green-600/20 hover:bg-green-500/30 border-green-500/30'
      },
      { 
        key: 'Ctrl+L', 
        description: 'Delete last screenshot',
        action: () => window.electronAPI?.deleteLastScreenshot?.(),
        bgColor: 'bg-yellow-600/20 hover:bg-yellow-500/30 border-yellow-500/30'
      }
    ],
    'Window Controls': [
      { 
        key: 'Ctrl+B', 
        description: 'Toggle window visibility',
        action: () => window.electronAPI?.toggleMainWindow?.(),
        bgColor: 'bg-cyan-600/20 hover:bg-cyan-500/30 border-cyan-500/30'
      },
      { 
        key: 'Ctrl+Left', 
        description: 'Move window left',
        action: () => window.electronAPI?.triggerMoveLeft?.(),
        bgColor: 'bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30'
      },
      { 
        key: 'Ctrl+Right', 
        description: 'Move window right',
        action: () => window.electronAPI?.triggerMoveRight?.(),
        bgColor: 'bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30'
      },
      { 
        key: 'Ctrl+Up', 
        description: 'Move window up',
        action: () => window.electronAPI?.triggerMoveUp?.(),
        bgColor: 'bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30'
      },
      { 
        key: 'Ctrl+Down', 
        description: 'Move window down',
        action: () => window.electronAPI?.triggerMoveDown?.(),
        bgColor: 'bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30'
      }
    ],
    'System Controls': [
      { 
        key: 'Ctrl+R', 
        description: 'Cancel requests and reset queues',
        action: () => window.electronAPI?.triggerReset?.(),
        bgColor: 'bg-orange-600/20 hover:bg-orange-500/30 border-orange-500/30'
      },
      { 
        key: 'Ctrl+Q', 
        description: 'Quit application',
        action: () => window.electronAPI?.quit?.(),
        bgColor: 'bg-red-600/20 hover:bg-red-500/30 border-red-500/30'
      }
    ],
    'Appearance (Keyboard Only)': [
      { 
        key: 'Ctrl+[', 
        description: 'Decrease opacity',
        action: () => console.log('Opacity decrease - keyboard only'),
        bgColor: 'bg-slate-600/20 hover:bg-slate-500/30 border-slate-500/30'
      },
      { 
        key: 'Ctrl+]', 
        description: 'Increase opacity',
        action: () => console.log('Opacity increase - keyboard only'),
        bgColor: 'bg-slate-600/20 hover:bg-slate-500/30 border-slate-500/30'
      },
      { 
        key: 'Ctrl+-', 
        description: 'Zoom out',
        action: () => console.log('Zoom out - keyboard only'),
        bgColor: 'bg-slate-600/20 hover:bg-slate-500/30 border-slate-500/30'
      },
      { 
        key: 'Ctrl+0', 
        description: 'Reset zoom',
        action: () => console.log('Reset zoom - keyboard only'),
        bgColor: 'bg-slate-600/20 hover:bg-slate-500/30 border-slate-500/30'
      },
      { 
        key: 'Ctrl+=', 
        description: 'Zoom in',
        action: () => console.log('Zoom in - keyboard only'),
        bgColor: 'bg-slate-600/20 hover:bg-slate-500/30 border-slate-500/30'
      }
    ]
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {Object.entries(shortcutCategories).map(([categoryName, shortcuts]) => (
              <div key={categoryName} className="space-y-3">
                <h3 className="text-sm font-semibold text-white/80 border-b border-slate-600/30 pb-1">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {shortcuts.map((shortcut, index) => (
                    <button
                      key={index}
                      className={`flex items-center justify-between p-3 ${shortcut.bgColor} rounded-md transition-colors text-left border`}
                      onClick={() => handleShortcutAction(shortcut.description, shortcut.action)}
                      title={`Click to execute: ${shortcut.description}`}
                    >
                      <div className="font-medium text-white text-sm">{shortcut.key}</div>
                      <div className="text-xs text-slate-200 flex-1 ml-3">{shortcut.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-slate-700">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-600/30 hover:bg-slate-500/40 border border-slate-500/30 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
