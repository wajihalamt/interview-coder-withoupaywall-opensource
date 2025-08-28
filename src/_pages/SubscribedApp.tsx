// file: src/components/SubscribedApp.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Queue from '../_pages/Queue';
import Solutions from '../_pages/Solutions';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useToast } from '../contexts/toast';

interface SubscribedAppProps {
  credits: number;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

const SubscribedApp: React.FC<SubscribedAppProps> = ({
  credits,
  currentLanguage,
  setLanguage,
}) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'queue' | 'solutions' | 'debug'>('queue');
  const [sidebarView, setSidebarView] = useState<'main' | 'settings'>('main');
  const { showToast } = useToast();

  // Let's ensure we reset queries etc. if some electron signals happen
  useEffect(() => {
    const cleanup = window.electronAPI.onResetView(() => {
      queryClient.invalidateQueries({
        queryKey: ['screenshots'],
      });
      queryClient.invalidateQueries({
        queryKey: ['problem_statement'],
      });
      queryClient.invalidateQueries({
        queryKey: ['solution'],
      });
      queryClient.invalidateQueries({
        queryKey: ['new_solution'],
      });
      setView('queue');
    });

    return () => {
      cleanup();
    };
  }, []);

  // Simplified event handling to prevent flickering
  useEffect(() => {
    const cleanupFunctions = [
      window.electronAPI.onSolutionStart(() => {
        setView('solutions');
      }),
      window.electronAPI.onUnauthorized(() => {
        queryClient.removeQueries({
          queryKey: ['screenshots'],
        });
        queryClient.removeQueries({
          queryKey: ['solution'],
        });
        queryClient.removeQueries({
          queryKey: ['problem_statement'],
        });
        setView('queue');
      }),
      window.electronAPI.onResetView(() => {
        queryClient.removeQueries({
          queryKey: ['screenshots'],
        });
        queryClient.removeQueries({
          queryKey: ['solution'],
        });
        queryClient.removeQueries({
          queryKey: ['problem_statement'],
        });
        setView('queue');
      }),
      window.electronAPI.onProblemExtracted((data: unknown) => {
        if (view === 'queue') {
          queryClient.invalidateQueries({
            queryKey: ['problem_statement'],
          });
          queryClient.setQueryData(['problem_statement'], data);
        }
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast('Error', error, 'error');
      }),
    ];
    return () => cleanupFunctions.forEach((fn) => fn());
  }, []); // Remove view dependency to prevent unnecessary re-renders

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar
        currentView={sidebarView}
        onViewChange={setSidebarView}
        currentLanguage={currentLanguage}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto content-stable no-flicker content-max-stable">
        {view === 'queue' ? (
          <Queue
            setView={setView}
            credits={credits}
            currentLanguage={currentLanguage}
            setLanguage={setLanguage}
          />
        ) : view === 'solutions' ? (
          <Solutions
            setView={setView}
            credits={credits}
            currentLanguage={currentLanguage}
            setLanguage={setLanguage}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SubscribedApp;
