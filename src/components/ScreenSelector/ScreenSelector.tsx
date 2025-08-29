import React, { useState, useEffect } from 'react';
import { X, Monitor, AppWindow, Globe, Mic } from 'lucide-react';

interface ScreenSource {
  id: string;
  name: string;
  type: 'screen' | 'window' | 'browser' | 'audio';
  thumbnail?: string;
}

interface ScreenSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceSelected: (source: ScreenSource) => void;
}

export const ScreenSelector: React.FC<ScreenSelectorProps> = ({
  open,
  onOpenChange,
  onSourceSelected,
}) => {
  const [sources, setSources] = useState<ScreenSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    'screen' | 'window' | 'browser' | 'audio'
  >('screen');

  useEffect(() => {
    if (open) {
      loadAvailableSources();
    }
  }, [open]);

  const loadAvailableSources = async () => {
    setLoading(true);
    try {
      const availableSources =
        await window.electronAPI?.getAvailableSources?.();
      setSources(availableSources || []);
    } catch (error) {
      console.error('Error loading sources:', error);
      setSources([]);
    }
    setLoading(false);
  };

  const handleSourceSelect = (source: ScreenSource) => {
    onSourceSelected(source);
    onOpenChange(false);
  };

  const filteredSources = sources.filter(
    (source) => source.type === selectedCategory
  );

  const categories = [
    {
      id: 'screen',
      name: 'Displays',
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'window',
      name: 'Applications',
      icon: <AppWindow className="w-4 h-4" />,
      color: 'bg-green-600/20 text-green-300 border-green-500/30',
    },
    {
      id: 'browser',
      name: 'Browser Windows',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'audio',
      name: 'Audio Sources',
      icon: <Mic className="w-4 h-4" />,
      color: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
    },
  ] as const;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Select Screen Source
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-700">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                selectedCategory === category.id
                  ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Browser Tab Limitation Notice */}
          {selectedCategory === 'browser' && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="text-purple-300 font-medium mb-1">
                    Browser Window Capture
                  </div>
                  <div className="text-slate-300">
                    Currently showing browser windows rather than individual
                    tabs. Selecting a browser window will capture its entire
                    content including all visible tabs.
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-slate-300">Loading sources...</span>
            </div>
          ) : filteredSources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSourceSelect(source)}
                  className={`p-4 rounded-lg border transition-all hover:scale-105 text-left ${
                    categories.find((c) => c.id === selectedCategory)?.color ||
                    'bg-slate-700/50 hover:bg-slate-600/70 border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {categories.find((c) => c.id === selectedCategory)?.icon}
                    <span className="font-medium text-white truncate">
                      {source.name}
                    </span>
                  </div>
                  {source.thumbnail && (
                    <div className="w-full h-24 bg-slate-600 rounded overflow-hidden">
                      <img
                        src={source.thumbnail}
                        alt={source.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-2 capitalize">
                    {source.type} Source
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <div className="text-4xl mb-2">🔍</div>
              <div>
                No{' '}
                {categories
                  .find((c) => c.id === selectedCategory)
                  ?.name.toLowerCase()}{' '}
                sources found
              </div>
              <div className="text-xs mt-1">
                Try selecting a different category above
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="text-xs text-slate-400">
            💡 Tip: You can also use keyboard shortcuts after selecting a source
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-600/30 hover:bg-slate-500/40 border border-slate-500/30 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
