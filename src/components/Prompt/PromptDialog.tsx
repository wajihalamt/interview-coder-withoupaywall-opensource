import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [screenshotPrompt, setScreenshotPrompt] = useState<string>('');
  const [systemPromptAppend, setSystemPromptAppend] = useState<string>('');
  const [defaultSystemPrompt] = useState<string>(
    'You are an expert coding interview assistant. Provide clear, optimal solutions with detailed explanations.'
  );

  // Load saved prompts on component mount
  useEffect(() => {
    if (open) {
      loadSavedPrompts();
    }
  }, [open]);

  const loadSavedPrompts = async () => {
    try {
      // Load saved prompts from config/storage
      const result = await window.electronAPI?.getCustomPrompts?.();
      console.log('Loaded prompts:', result);
      if (result) {
        setScreenshotPrompt(result.screenshotPrompt || '');
        setSystemPromptAppend(result.systemPromptAppend || '');
      }
    } catch (error) {
      console.error('Error loading saved prompts:', error);
    }
  };

  const savePrompts = async () => {
    try {
      const result = await window.electronAPI?.saveCustomPrompts?.({
        screenshotPrompt,
        systemPromptAppend,
      });

      if (result?.success) {
        console.log('Prompts saved successfully');
        onOpenChange(false);
      } else {
        console.error('Failed to save prompts:', result?.error);
      }
    } catch (error) {
      console.error('Error saving prompts:', error);
    }
  };

  const resetPrompts = () => {
    setScreenshotPrompt('');
    setSystemPromptAppend('');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Custom Prompts</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Default System Prompt Display */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current System Prompt
            </label>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-300">
              {defaultSystemPrompt}
              {systemPromptAppend && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <span className="text-purple-300 font-medium">
                    + Your Addition:
                  </span>
                  <div className="mt-1">{systemPromptAppend}</div>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Screenshot Analysis Prompt
            </label>
            <p className="text-xs text-slate-400 mb-3">
              This prompt will be used when analyzing screenshots. Leave empty
              to use default behavior.
            </p>
            <textarea
              value={screenshotPrompt}
              onChange={(e) => setScreenshotPrompt(e.target.value)}
              placeholder="Enter custom prompt for screenshot analysis..."
              className="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* System Prompt Append */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              System Prompt Addition
            </label>
            <p className="text-xs text-slate-400 mb-3">
              This text will be appended to the default system prompt to
              customize the AI's behavior.
            </p>
            <textarea
              value={systemPromptAppend}
              onChange={(e) => setSystemPromptAppend(e.target.value)}
              placeholder="Enter additional instructions for the AI..."
              className="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Examples */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Examples:
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <span className="text-blue-300">Screenshot Prompt:</span>
                <div className="pl-2 italic">
                  "Analyze this coding problem screenshot and identify the
                  problem statement, constraints, and examples."
                </div>
              </div>
              <div>
                <span className="text-purple-300">System Addition:</span>
                <div className="pl-2 italic">
                  "Focus on writing clean, well-commented code with optimal time
                  complexity. Always explain the approach step by step."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-700">
          <button
            onClick={resetPrompts}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-slate-600/30 hover:bg-slate-500/40 border border-slate-500/30 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePrompts}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
            >
              Save Prompts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
