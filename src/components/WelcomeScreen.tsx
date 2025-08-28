import React from 'react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenSettings,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-black min-h-screen flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-lg w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            WajihCoder
          </h1>
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
            Unlocked Edition
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Welcome! 👋
          </h2>
          <p className="text-slate-300 text-center leading-relaxed mb-6">
            Your AI-powered assistant for acing technical interviews. Take
            screenshots of coding problems and get instant solutions!
          </p>
          {/* Quick Start Guide */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              ⚡ Quick Start Guide
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm">
                  1
                </div>
                <span className="text-slate-300 text-sm">
                  Take a screenshot of your problem
                </span>
                <code className="ml-auto px-2 py-1 bg-slate-700/50 rounded text-xs text-blue-300">
                  Ctrl+H
                </code>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-300 font-bold text-sm">
                  2
                </div>
                <span className="text-slate-300 text-sm">
                  Process with AI to get solution
                </span>
                <code className="ml-auto px-2 py-1 bg-slate-700/50 rounded text-xs text-green-300">
                  Ctrl+↵
                </code>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm">
                  3
                </div>
                <span className="text-slate-300 text-sm">
                  Copy solution and ace your interview!
                </span>
                <span className="ml-auto text-lg">🎉</span>
              </div>
            </div>
          </div>

          {/* Additional Shortcuts */}
          <details className="mb-6">
            <summary className="text-slate-400 text-sm cursor-pointer hover:text-white transition-colors">
              📋 All Keyboard Shortcuts
            </summary>
            <div className="mt-3 space-y-2 pl-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Hide/Show App</span>
                <code className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                  Ctrl+B
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Delete Last Screenshot</span>
                <code className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                  Ctrl+L
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Reset Everything</span>
                <code className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                  Ctrl+R
                </code>
              </div>
            </div>
          </details>
        </div>

        {/* Setup Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            ⚙️ Setup Required
          </h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            To get started, you'll need to add your OpenAI API key. This enables
            the AI-powered problem solving features.
          </p>
          <Button
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            onClick={onOpenSettings}
          >
            <span>🔧</span>
            Configure API Key
          </Button>
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Ready to solve coding problems with AI? Let's get started! 🎯
          </p>
        </div>
      </div>
    </div>
  );
};
