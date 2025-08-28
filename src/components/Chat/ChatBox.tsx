import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Camera } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await window.electronAPI.getChatHistory?.();
        if (response?.success && response.messages) {
          const loadedMessages: Message[] = response.messages.map((msg: any) => ({
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

    return () => {
      cleanupChatCleared?.();
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

  // Process screenshots and add results to chat
  const handleProcessScreenshots = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Add processing message to chat
    const processingMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: '🔄 Processing screenshots... This may take a moment.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, processingMessage]);
    await saveMessageToPersistentStorage(processingMessage);

    try {
      // Call the screenshot processing through Electron API
      const response = await window.electronAPI.processScreenshotsForChat?.();
      
      if (response?.success) {
        // Remove the processing message
        setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));

        // Add problem statement if available
        if (response.problemStatement) {
          const problemMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `📋 **Problem Statement:**\n\n${response.problemStatement}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, problemMessage]);
          await saveMessageToPersistentStorage(problemMessage);
        }

        // Add solution if available
        if (response.solution) {
          const solutionMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `💡 **Solution:**\n\n\`\`\`${response.language || 'javascript'}\n${response.solution}\n\`\`\``,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, solutionMessage]);
          await saveMessageToPersistentStorage(solutionMessage);
        }

        // Add thoughts if available
        if (response.thoughts && response.thoughts.length > 0) {
          const thoughtsContent = response.thoughts.map((thought: string, index: number) => 
            `${index + 1}. ${thought}`
          ).join('\n');
          
          const thoughtsMessage: Message = {
            id: (Date.now() + 3).toString(),
            type: 'ai',
            content: `🤔 **My Thoughts:**\n\n${thoughtsContent}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, thoughtsMessage]);
          await saveMessageToPersistentStorage(thoughtsMessage);
        }

        // Add complexity analysis if available
        if (response.timeComplexity || response.spaceComplexity) {
          const complexityContent = [
            response.timeComplexity ? `**Time Complexity:** ${response.timeComplexity}` : '',
            response.spaceComplexity ? `**Space Complexity:** ${response.spaceComplexity}` : ''
          ].filter(Boolean).join('\n');

          const complexityMessage: Message = {
            id: (Date.now() + 4).toString(),
            type: 'ai',
            content: `📊 **Complexity Analysis:**\n\n${complexityContent}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, complexityMessage]);
          await saveMessageToPersistentStorage(complexityMessage);
        }

        showToast('Success', 'Screenshots processed successfully!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to process screenshots');
      }
    } catch (error) {
      console.error('Error processing screenshots:', error);
      
      // Remove the processing message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ Sorry, I encountered an error while processing the screenshots. Please make sure you have taken some screenshots first and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToPersistentStorage(errorMessage);
      
      showToast('Error', 'Failed to process screenshots', 'error');
    } finally {
      setIsLoading(false);
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
        throw new Error(response?.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error', 'Failed to send message to AI', 'error');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      // Save error message to persistent storage
      await saveMessageToPersistentStorage(errorMessage);
    } finally {
      setIsLoading(false);
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
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the AI assistant anything..."
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-colors"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleProcessScreenshots}
            disabled={isLoading}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
            title="Process Screenshots"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
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
          Press Enter to send, Shift+Enter for new line • Click 📷 to process screenshots
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
