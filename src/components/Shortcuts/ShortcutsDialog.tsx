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

  const shortcuts = [
    { key: 'Ctrl+H', description: 'Take a screenshot' },
    { key: 'Ctrl+Enter', description: 'Process screenshots' },
    { key: 'Ctrl+R', description: 'Cancel requests and reset queues' },
    { key: 'Ctrl+Left', description: 'Move window left' },
    { key: 'Ctrl+Right', description: 'Move window right' },
    { key: 'Ctrl+Down', description: 'Move window down' },
    { key: 'Ctrl+Up', description: 'Move window up' },
    { key: 'Ctrl+B', description: 'Toggle window visibility' },
    { key: 'Ctrl+Q', description: 'Quit application' },
    { key: 'Ctrl+[', description: 'Decrease opacity' },
    { key: 'Ctrl+]', description: 'Increase opacity' },
    { key: 'Ctrl+-', description: 'Zoom out' },
    { key: 'Ctrl+0', description: 'Reset zoom' },
    { key: 'Ctrl+=', description: 'Zoom in' },
    { key: 'Ctrl+L', description: 'Delete last screenshot' }
  ];

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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md"
                >
                  <div className="font-medium text-white">{shortcut.key}</div>
                  <div className="text-sm text-slate-300">{shortcut.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-slate-700">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
