import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Square } from 'lucide-react';
import { useToast } from '../../contexts/toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  className?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingScreenshots, setIsProcessingScreenshots] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await window.electronAPI.getChatHistory?.();
        if (response?.success && response.messages) {
          const loadedMessages: Message[] = response.messages.map((msg: { id: string; type: string; content: string; timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();

    // Listen for chat history cleared events
    const cleanupChatCleared = window.electronAPI.onChatHistoryCleared?.(() => {
      console.log('Chat history cleared event received');
      setMessages([]);
    });

    // Listen for screenshots processed for chat (from Ctrl+Enter or Process Screenshots button)
    const cleanupScreenshotsProcessed = window.electronAPI.onScreenshotsProcessedForChat?.((data: { success: boolean; data?: { problemStatement: string; solution: string; thoughts: string; timeComplexity: string; spaceComplexity: string; language: string; } }) => {
      console.log('Screenshots processed for chat event received', data);
      
      if (data.success) {
        handleScreenshotProcessingResults(data);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: '❌ Sorry, I encountered an error while processing the screenshots. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        saveMessageToPersistentStorage(errorMessage);
      }
    });

    return () => {
      cleanupChatCleared?.();
      cleanupScreenshotsProcessed?.();
    };
  }, []);

  // Listen for AI thinking messages from preload script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ai-thinking-start') {
        setIsProcessingScreenshots(true);
        const thinkingMessage: Message = {
          id: `thinking-${Date.now()}`,
          type: 'ai',
          content: event.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, thinkingMessage]);
        // Don't save thinking message to persistent storage as it's temporary
      } else if (event.data.type === 'ai-thinking-error') {
        setIsProcessingScreenshots(false);
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: event.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        saveMessageToPersistentStorage(errorMessage);
      } else if (event.data.type === 'processing-stopped') {
        setIsProcessingScreenshots(false);
        // Remove any thinking messages
        setMessages(prev => prev.filter(msg => !msg.id.startsWith('thinking-')));
        const stopMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: '⏹️ Processing stopped by user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, stopMessage]);
        saveMessageToPersistentStorage(stopMessage);
      } else if (event.data.type === 'processing-stop-error') {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: event.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        saveMessageToPersistentStorage(errorMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Save message to persistent storage
  const saveMessageToPersistentStorage = async (message: Message) => {
    try {
      await window.electronAPI.saveChatMessage?.({
        id: message.id,
        type: message.type,
        content: message.content
      });
    } catch (error) {
      console.error('Error saving message to persistent storage:', error);
    }
  };

  // Handle screenshot processing results from event (unified workflow)
  const handleScreenshotProcessingResults = (data: { 
    success: boolean; 
    data?: { 
      problemStatement: string; 
      solution: string; 
      thoughts: string; 
      timeComplexity: string; 
      spaceComplexity: string; 
      language: string; 
    } 
  }) => {
    // Remove any thinking messages first and clear processing state
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('thinking-')));
    setIsProcessingScreenshots(false);
    
    if (data.success && data.data) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `## 📸 Screenshot Analysis Complete

**Problem Statement:**
${data.data.problemStatement}

**Solution:**
\`\`\`${data.data.language || 'python'}
${data.data.solution}
\`\`\`

**Approach & Thoughts:**
${data.data.thoughts}

**Complexity Analysis:**
- **Time Complexity:** ${data.data.timeComplexity}
- **Space Complexity:** ${data.data.spaceComplexity}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveMessageToPersistentStorage(aiMessage);
      showToast('Success', 'Screenshots processed successfully!', 'success');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    // Save user message to persistent storage
    await saveMessageToPersistentStorage(userMessage);
    
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the AI service through Electron API
      const response = await window.electronAPI.sendChatMessage?.(currentInput);
      
      if (response?.success && response?.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        // Save AI message to persistent storage
        await saveMessageToPersistentStorage(aiMessage);
      } else {
        const errorText = response?.error || 'Failed to get AI response';
        showToast('Warning', errorText, 'neutral');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: errorText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        await saveMessageToPersistentStorage(errorMessage);
        return;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error', 'Failed to send message to AI', 'error');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: (error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.'),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      // Save error message to persistent storage
      await saveMessageToPersistentStorage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopProcessing = async () => {
    try {
      console.log('Stopping processing...');
      const result = await window.electronAPI.stopProcessing();
      if (result.success) {
        console.log('Processing stopped successfully');
        showToast('Info', 'Processing stopped', 'neutral');
      } else {
        console.log('Failed to stop processing:', result.message);
        showToast('Warning', result.message || 'No processing to stop', 'neutral');
      }
    } catch (error) {
      console.error('Error stopping processing:', error);
      showToast('Error', 'Failed to stop processing', 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          AI Assistant
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Ask me anything about your coding problems!
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              Start a conversation with the AI assistant!
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Ask about coding problems, debugging tips, or anything else.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-100 border border-slate-600/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 opacity-60 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg text-sm bg-slate-700/50 text-slate-100 border border-slate-600/30">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-600/30">
        {/* Screenshot Processing Status Indicator */}
        {isProcessingScreenshots && (
          <div className="mb-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-blue-300">Processing Screenshots</div>
                  <div className="text-xs text-blue-400/70">AI is analyzing your screenshots... This may take a moment.</div>
                </div>
              </div>
              <button
                onClick={handleStopProcessing}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5"
                title="Stop processing (Ctrl+Shift+S)"
              >
                <Square className="w-3 h-3" />
                Stop
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the AI assistant anything..."
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-colors"
            rows={1}
            disabled={isLoading || isProcessingScreenshots}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isProcessingScreenshots}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line • Press Ctrl+Enter to process screenshots • Press Ctrl+Shift+S to stop processing
          {isProcessingScreenshots && <span className="text-blue-400"> • Screenshots are being processed...</span>}
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
