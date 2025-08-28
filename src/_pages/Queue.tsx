import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ScreenshotQueue from '../components/Queue/ScreenshotQueue';
import ChatBox from '../components/Chat/ChatBox';

import { useToast } from '../contexts/toast';
import { Screenshot } from '../types/screenshots';

async function fetchScreenshots(): Promise<Screenshot[]> {
  try {
    const existing = await window.electronAPI.getScreenshots();
    return existing;
  } catch (error) {
    console.error('Error loading screenshots:', error);
    throw error;
  }
}

interface QueueProps {
  setView: (view: 'queue' | 'solutions' | 'debug') => void;
  credits: number;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

const Queue: React.FC<QueueProps> = ({
  setView,
  credits, // Available but not used in simplified layout - Actions tab handles this
  currentLanguage, // Available but not used in simplified layout - Actions tab handles this  
  setLanguage, // Available but not used in simplified layout - Actions tab handles this
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: screenshots = [], refetch } = useQuery<Screenshot[]>({
    queryKey: ['screenshots'],
    queryFn: fetchScreenshots,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Listen for screenshot deletion events
  useEffect(() => {
    const handleScreenshotDeleted = () => {
      console.log('Screenshot deleted event received, refetching screenshots');
      queryClient.invalidateQueries({ queryKey: ['screenshots'] });
    };

    // Add event listener for screenshot deletion
    window.electronAPI.onScreenshotDeleted?.(handleScreenshotDeleted);

    return () => {
      // Cleanup listener if available
      window.electronAPI.removeScreenshotDeletedListener?.(handleScreenshotDeleted);
    };
  }, [queryClient]);

  const handleDeleteScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index];

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      );

      if (response.success) {
        refetch(); // Refetch screenshots instead of managing state directly
      } else {
        console.error('Failed to delete screenshot:', response.error);
        showToast('Error', 'Failed to delete the screenshot file', 'error');
      }
    } catch (error) {
      console.error('Error deleting screenshot:', error);
    }
  };

  useEffect(() => {
    // Set up event listeners only - no dimension updates
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => {
        console.log('Queue: received reset-view event, refetching screenshots...');
        queryClient.invalidateQueries({ queryKey: ['screenshots'] });
        refetch();
      }),
      window.electronAPI.onReset(() => {
        console.log('Queue: received reset event, invalidating screenshots cache...');
        queryClient.invalidateQueries({ queryKey: ['screenshots'] });
        refetch();
      }),
      window.electronAPI.onDeleteLastScreenshot(async () => {
        if (screenshots.length > 0) {
          await handleDeleteScreenshot(screenshots.length - 1);
        } else {
          showToast(
            'No Screenshots',
            'There are no screenshots to delete',
            'neutral'
          );
        }
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast(
          'Processing Failed',
          'There was an error processing your screenshots.',
          'error'
        );
        setView('queue');
        console.error('Processing error:', error);
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          'No Screenshots',
          'There are no screenshots to process.',
          'neutral'
        );
      }),
    ];

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []); // No dependencies to prevent re-runs

  return (
    <div className="bg-gradient-to-br from-slate-900 to-black min-h-screen overflow-y-auto no-flicker queue-stable">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-2xl">📸</span>
            Interview Problem Solver
          </h1>
          <p className="text-slate-400">
            Take screenshots of your coding problems and let AI help you solve
            them!
          </p>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="space-y-8">
          {/* Screenshots Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📋</span>
                Screenshots ({screenshots.length})
              </h2>
              {screenshots.length > 0 && (
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                  Ready to process
                </span>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6">
              <ScreenshotQueue
                isLoading={false}
                screenshots={screenshots}
                onDeleteScreenshot={handleDeleteScreenshot}
              />

              {screenshots.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📷</div>
                  <p className="text-slate-400 mb-4">No screenshots yet</p>
                  <p className="text-sm text-slate-500">
                    Press{' '}
                    <code className="px-2 py-1 bg-slate-700 rounded text-blue-300">
                      Ctrl+H
                    </code>{' '}
                    to take your first screenshot
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>💬</span>
              AI Assistant
            </h2>
            
            <ChatBox className="h-[500px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Queue;
