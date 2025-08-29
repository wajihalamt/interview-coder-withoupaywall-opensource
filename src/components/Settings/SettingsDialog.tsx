import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/toast';

type APIProvider = 'openai' | 'gemini' | 'anthropic' | 'github';

type AIModel = {
  id: string;
  name: string;
  description: string;
};

type ModelCategory = {
  key: 'extractionModel' | 'solutionModel' | 'debuggingModel';
  title: string;
  description: string;
  openaiModels: AIModel[];
  geminiModels: AIModel[];
  anthropicModels: AIModel[];
  githubModels: AIModel[];
};

// Define available models for each category
const modelCategories: ModelCategory[] = [
  {
    key: 'extractionModel',
    title: 'Problem Extraction',
    description:
      'Model used to analyze screenshots and extract problem details',
    openaiModels: [
      {
        id: 'gpt-4.1',
        name: 'gpt-4.1',
        description: 'High capability GPT-4.1 model for extraction',
      },
      {
        id: 'gpt-4o',
        name: 'gpt-4o',
        description: 'Best overall performance for problem extraction',
      },
      {
        id: 'gpt-4o-mini',
        name: 'gpt-4o-mini',
        description: 'Faster, more cost-effective option',
      },
    ],
    geminiModels: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Best overall performance for problem extraction',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Faster, more cost-effective option',
      },
    ],
    anthropicModels: [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Best overall performance for problem extraction',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and speed',
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Top-level intelligence, fluency, and understanding',
      },
    ],
    githubModels: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Latest flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Multimodal flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o mini',
        description: 'Affordable, intelligent small model',
      },
      {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        description: 'Latest Anthropic model via GitHub Models',
      },
    ],
  },
  {
    key: 'solutionModel',
    title: 'Solution Generation',
    description: 'Model used to generate coding solutions',
    openaiModels: [
      {
        id: 'gpt-4.1',
        name: 'gpt-4.1',
        description: 'High capability GPT-4.1 model for solutions',
      },
      {
        id: 'gpt-4o',
        name: 'gpt-4o',
        description: 'Strong overall performance for coding tasks',
      },
      {
        id: 'gpt-4o-mini',
        name: 'gpt-4o-mini',
        description: 'Faster, more cost-effective option',
      },
    ],
    geminiModels: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Strong overall performance for coding tasks',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Faster, more cost-effective option',
      },
    ],
    anthropicModels: [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Strong overall performance for coding tasks',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and speed',
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Top-level intelligence, fluency, and understanding',
      },
    ],
    githubModels: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Latest flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Multimodal flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o mini',
        description: 'Affordable, intelligent small model',
      },
      {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        description: 'Latest Anthropic model via GitHub Models',
      },
    ],
  },
  {
    key: 'debuggingModel',
    title: 'Debugging',
    description: 'Model used to debug and improve solutions',
    openaiModels: [
      {
        id: 'gpt-4.1',
        name: 'gpt-4.1',
        description: 'High capability GPT-4.1 model for debugging',
      },
      {
        id: 'gpt-4o',
        name: 'gpt-4o',
        description: 'Best for analyzing code and error messages',
      },
      {
        id: 'gpt-4o-mini',
        name: 'gpt-4o-mini',
        description: 'Faster, more cost-effective option',
      },
    ],
    geminiModels: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Best for analyzing code and error messages',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Faster, more cost-effective option',
      },
    ],
    anthropicModels: [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Best for analyzing code and error messages',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and speed',
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Top-level intelligence, fluency, and understanding',
      },
    ],
    githubModels: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Latest flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Multimodal flagship model via GitHub Models',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o mini',
        description: 'Affordable, intelligent small model',
      },
      {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        description: 'Latest Anthropic model via GitHub Models',
      },
    ],
  },
];

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({
  open: externalOpen,
  onOpenChange,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(externalOpen || false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<APIProvider>('openai');
  const [extractionModel, setExtractionModel] = useState('gpt-4o');
  const [solutionModel, setSolutionModel] = useState('gpt-4o');
  const [debuggingModel, setDebuggingModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Sync with external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Only call onOpenChange when there's actually a change
    if (onOpenChange && newOpen !== externalOpen) {
      onOpenChange(newOpen);
    }
  };

  // Load current config on dialog open
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      interface Config {
        apiKey?: string;
        apiProvider?: APIProvider;
        extractionModel?: string;
        solutionModel?: string;
        debuggingModel?: string;
      }

      window.electronAPI
        .getConfig()
        .then((config: Config) => {
          setApiKey(config.apiKey || '');
          setApiProvider(config.apiProvider || 'openai');
          setExtractionModel(config.extractionModel || 'gpt-4o');
          setSolutionModel(config.solutionModel || 'gpt-4o');
          setDebuggingModel(config.debuggingModel || 'gpt-4o');
        })
        .catch((error: unknown) => {
          console.error('Failed to load config:', error);
          showToast('Error', 'Failed to load settings', 'error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, showToast]);

  // Handle API provider change
  const handleProviderChange = (provider: APIProvider) => {
    setApiProvider(provider);

    // Reset models to defaults when changing provider
    if (provider === 'openai') {
      setExtractionModel('gpt-4o');
      setSolutionModel('gpt-4o');
      setDebuggingModel('gpt-4o');
    } else if (provider === 'gemini') {
      setExtractionModel('gemini-1.5-pro');
      setSolutionModel('gemini-1.5-pro');
      setDebuggingModel('gemini-1.5-pro');
    } else if (provider === 'anthropic') {
      setExtractionModel('claude-3-7-sonnet-20250219');
      setSolutionModel('claude-3-7-sonnet-20250219');
      setDebuggingModel('claude-3-7-sonnet-20250219');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.updateConfig({
        apiKey,
        apiProvider,
        extractionModel,
        solutionModel,
        debuggingModel,
      });

      if (result) {
        showToast('Success', 'Settings saved successfully', 'success');
        handleOpenChange(false);

        // Force reload the app to apply the API key
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Error', 'Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return '';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  // Open external link handler
  const openExternalLink = (url: string) => {
    window.electronAPI.openLink(url);
  };

  // Handle shortcut button clicks with feedback
  const handleShortcutAction = async (
    action: string,
    apiCall: () => Promise<{ success: boolean; error?: string }>
  ) => {
    console.log(`${action} button clicked!`);
    try {
      const result = await apiCall();
      console.log(`${action} result:`, result);
      if (result.success) {
        showToast('Success', `${action} executed successfully`, 'success');
      } else {
        showToast(
          'Error',
          result.error || `Failed to ${action.toLowerCase()}`,
          'error'
        );
      }
    } catch (error: unknown) {
      console.error(`Error executing ${action}:`, error);
      showToast('Error', `Failed to ${action.toLowerCase()}`, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-black border border-white/10 text-white settings-dialog"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(450px, 90vw)',
          height: 'auto',
          minHeight: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 9999,
          margin: 0,
          padding: '20px',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          animation: 'fadeIn 0.25s ease forwards',
          opacity: 0.98,
        }}
      >
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription className="text-white/70">
            Configure your API key and model preferences. You'll need your own
            API key to use this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* API Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              API Provider
            </label>
            <div className="flex gap-2">
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === 'openai'
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-black/30 border border-white/5 hover:bg-white/5'
                }`}
                onClick={() => handleProviderChange('openai')}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === 'openai' ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">OpenAI</p>
                    <p className="text-xs text-white/60">GPT-4o models</p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === 'gemini'
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-black/30 border border-white/5 hover:bg-white/5'
                }`}
                onClick={() => handleProviderChange('gemini')}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === 'gemini' ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">Gemini</p>
                    <p className="text-xs text-white/60">Gemini 1.5 models</p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === 'anthropic'
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-black/30 border border-white/5 hover:bg-white/5'
                }`}
                onClick={() => handleProviderChange('anthropic')}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === 'anthropic' ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">Claude</p>
                    <p className="text-xs text-white/60">Claude 3 models</p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === 'github'
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-black/30 border border-white/5 hover:bg-white/5'
                }`}
                onClick={() => handleProviderChange('github')}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === 'github' ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">
                      GitHub Models
                    </p>
                    <p className="text-xs text-white/60">GitHub Models API</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="apiKey">
              {apiProvider === 'openai'
                ? 'OpenAI API Key'
                : apiProvider === 'gemini'
                ? 'Gemini API Key'
                : apiProvider === 'github'
                ? 'GitHub Personal Access Token'
                : 'Anthropic API Key'}
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                apiProvider === 'openai'
                  ? 'sk-...'
                  : apiProvider === 'gemini'
                  ? 'Enter your Gemini API key'
                  : apiProvider === 'github'
                  ? 'ghp_... or github_pat_...'
                  : 'sk-ant-...'
              }
              className="bg-black/50 border-white/10 text-white"
            />
            {apiKey && (
              <p className="text-xs text-white/50">
                Current: {maskApiKey(apiKey)}
              </p>
            )}
            <p className="text-xs text-white/50">
              {apiProvider === 'openai' &&
                'Your API key is stored locally and never sent to any server except OpenAI'}
              {apiProvider === 'gemini' &&
                'Your API key is stored locally and never sent to any server except Google'}
              {apiProvider === 'anthropic' &&
                'Your API key is stored locally and never sent to any server except Anthropic'}
              {apiProvider === 'github' &&
                'Your GitHub PAT is stored locally and only used for GitHub Models API'}
            </p>

            {/* Additional info for GitHub provider */}
            {apiProvider === 'github' && (
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300 font-medium mb-1">
                  GitHub Models API Setup:
                </p>
                <ul className="text-xs text-blue-200/80 space-y-1">
                  <li>
                    1. Create a Personal Access Token at
                    github.com/settings/tokens
                  </li>
                  <li>
                    2. Ensure you have access to GitHub Models (currently in
                    preview)
                  </li>
                  <li>3. Use the PAT as your API key above</li>
                </ul>
              </div>
            )}
            <div className="mt-2 p-2 rounded-md bg-white/5 border border-white/10">
              <p className="text-xs text-white/80 mb-1">
                Don't have an API key?
              </p>
              {apiProvider === 'openai' ? (
                <>
                  <p className="text-xs text-white/60 mb-1">
                    1. Create an account at{' '}
                    <button
                      onClick={() =>
                        openExternalLink('https://platform.openai.com/signup')
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      OpenAI
                    </button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">
                    2. Go to{' '}
                    <button
                      onClick={() =>
                        openExternalLink('https://platform.openai.com/api-keys')
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      API Keys
                    </button>{' '}
                    section
                  </p>
                  <p className="text-xs text-white/60">
                    3. Create a new secret key and paste it here
                  </p>
                </>
              ) : apiProvider === 'gemini' ? (
                <>
                  <p className="text-xs text-white/60 mb-1">
                    1. Create an account at{' '}
                    <button
                      onClick={() =>
                        openExternalLink('https://aistudio.google.com/')
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      Google AI Studio
                    </button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">
                    2. Go to the{' '}
                    <button
                      onClick={() =>
                        openExternalLink(
                          'https://aistudio.google.com/app/apikey'
                        )
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      API Keys
                    </button>{' '}
                    section
                  </p>
                  <p className="text-xs text-white/60">
                    3. Create a new API key and paste it here
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/60 mb-1">
                    1. Create an account at{' '}
                    <button
                      onClick={() =>
                        openExternalLink('https://console.anthropic.com/signup')
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      Anthropic
                    </button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">
                    2. Go to the{' '}
                    <button
                      onClick={() =>
                        openExternalLink(
                          'https://console.anthropic.com/settings/keys'
                        )
                      }
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      API Keys
                    </button>{' '}
                    section
                  </p>
                  <p className="text-xs text-white/60">
                    3. Create a new API key and paste it here
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-white mb-2 block">
              Keyboard Shortcuts
            </label>
            <p className="text-xs text-white/60 -mt-1 mb-2">
              Click the buttons below or use keyboard shortcuts
            </p>
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-1 gap-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Toggle Visibility</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+B
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-cyan-600/20 border border-cyan-500/30 rounded hover:bg-cyan-500/30 text-white cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Toggle window button clicked!');
                        handleShortcutAction(
                          'Toggle window',
                          window.electronAPI.toggleMainWindow
                        );
                      }}
                    >
                      Toggle
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Take Screenshot</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+H
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-blue-600/20 border border-blue-500/30 rounded hover:bg-blue-500/30 text-white cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Take screenshot button clicked!');
                        handleShortcutAction(
                          'Take screenshot',
                          window.electronAPI.triggerScreenshot
                        );
                      }}
                    >
                      Screenshot
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Process Screenshots</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+Enter
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-green-600/20 border border-green-500/30 rounded hover:bg-green-500/30 text-white cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Process screenshots button clicked!');
                        handleShortcutAction(
                          'Process screenshots',
                          window.electronAPI.triggerProcessScreenshots
                        );
                      }}
                    >
                      Process
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Delete Last Screenshot</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+L
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-yellow-600/20 border border-yellow-500/30 rounded hover:bg-yellow-500/30 text-white cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Delete last screenshot button clicked!');
                        handleShortcutAction(
                          'Delete last screenshot',
                          window.electronAPI.deleteLastScreenshot
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Reset View</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+R
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-orange-600/20 border border-orange-500/30 rounded hover:bg-orange-500/30 text-white cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Reset view button clicked!');
                        handleShortcutAction(
                          'Reset view',
                          window.electronAPI.triggerReset
                        );
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Quit Application</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono text-xs">
                      Ctrl+Q
                    </span>
                    <button
                      className="h-6 px-2 text-xs bg-red-400/10 border border-red-400/30 rounded hover:bg-red-400/15 text-red-400 cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('Quit application button clicked!');
                        handleShortcutAction(
                          'Quit application',
                          window.electronAPI.quit
                        );
                      }}
                    >
                      Quit
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-white/60 text-xs mb-2 font-medium">
                    Window Movement
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="h-6 text-xs px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      onClick={() => {
                        console.log('Move Left button clicked');
                        handleShortcutAction(
                          'Move window left',
                          window.electronAPI.triggerMoveLeft
                        );
                      }}
                    >
                      ← Move Left
                    </button>
                    <button
                      className="h-6 text-xs px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      onClick={() => {
                        console.log('Move Right button clicked');
                        handleShortcutAction(
                          'Move window right',
                          window.electronAPI.triggerMoveRight
                        );
                      }}
                    >
                      → Move Right
                    </button>
                    <button
                      className="h-6 text-xs px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      onClick={() => {
                        console.log('Move Up button clicked');
                        handleShortcutAction(
                          'Move window up',
                          window.electronAPI.triggerMoveUp
                        );
                      }}
                    >
                      ↑ Move Up
                    </button>
                    <button
                      className="h-6 text-xs px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      onClick={() => {
                        console.log('Move Down button clicked');
                        handleShortcutAction(
                          'Move window down',
                          window.electronAPI.triggerMoveDown
                        );
                      }}
                    >
                      ↓ Move Down
                    </button>
                  </div>
                  <div className="text-xs text-white/40 mt-1 text-center">
                    Ctrl+Arrow Keys
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-white/60 text-xs mb-2 font-medium">
                    Window Controls
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="h-6 text-xs px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      onClick={() => {
                        console.log('Minimize button clicked');
                        handleShortcutAction(
                          'Minimize window',
                          window.electronAPI.minimize
                        );
                      }}
                    >
                      Minimize
                    </button>
                    <div className="text-xs text-white/50 flex items-center">
                      Various zoom/opacity controls work via keyboard only
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <label className="text-sm font-medium text-white">
              AI Model Selection
            </label>
            <p className="text-xs text-white/60 -mt-3 mb-2">
              Select which models to use for each stage of the process
            </p>

            {modelCategories.map((category) => {
              // Get the appropriate model list based on selected provider
              const models =
                apiProvider === 'openai'
                  ? category.openaiModels
                  : apiProvider === 'gemini'
                  ? category.geminiModels
                  : apiProvider === 'github'
                  ? category.githubModels
                  : category.anthropicModels;

              return (
                <div key={category.key} className="mb-4">
                  <label className="text-sm font-medium text-white mb-1 block">
                    {category.title}
                  </label>
                  <p className="text-xs text-white/60 mb-2">
                    {category.description}
                  </p>

                  <div className="space-y-2">
                    {models.map((m) => {
                      // Determine which state to use based on category key
                      const currentValue =
                        category.key === 'extractionModel'
                          ? extractionModel
                          : category.key === 'solutionModel'
                          ? solutionModel
                          : debuggingModel;

                      // Determine which setter function to use
                      const setValue =
                        category.key === 'extractionModel'
                          ? setExtractionModel
                          : category.key === 'solutionModel'
                          ? setSolutionModel
                          : setDebuggingModel;

                      return (
                        <div
                          key={m.id}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            currentValue === m.id
                              ? 'bg-white/10 border border-white/20'
                              : 'bg-black/30 border border-white/5 hover:bg-white/5'
                          }`}
                          onClick={() => setValue(m.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                currentValue === m.id
                                  ? 'bg-white'
                                  : 'bg-white/20'
                              }`}
                            />
                            <div>
                              <p className="font-medium text-white text-xs">
                                {m.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {m.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-white/10 hover:bg-white/5 text-white"
          >
            Cancel
          </Button>
          <Button
            className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
            onClick={handleSave}
            disabled={isLoading || !apiKey}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
