'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AISuggestionCard } from './AISuggestionCard';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { QUICK_MOODS } from '@/lib/gemini-config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: any[];
}

interface AIChatAssistantProps {
  onViewExperience?: (id: string) => void;
  onViewRetreat?: (id: string) => void;
  inline?: boolean; // If true, show chat interface directly instead of floating button
}

export function AIChatAssistant({ onViewExperience, onViewRetreat, inline = false }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(inline); // Auto-open if inline
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive (only if chat is maximized or has messages)
  useEffect(() => {
    // Don't auto-scroll on initial inline render with no messages
    if (messages.length > 0 && (isMaximized || !inline)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMaximized, inline]);

  // Focus input when chat opens (but not on initial load)
  useEffect(() => {
    // Only auto-focus if chat was opened by user interaction, not on initial inline render
    if (isOpen && inputRef.current && isMaximized) {
      // Delay focus to avoid scrolling issues
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMaximized]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
        suggestions: data.data.suggestions || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      
      let errorContent = "I'm having trouble thinking right now. Please try again! 😅";
      
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorContent = "I'm not fully set up yet. Please contact support to enable AI features! 🔧";
        } else if (err.message.includes('rate limit')) {
          errorContent = "I'm getting too many requests. Please wait a moment and try again! ⏳";
        } else if (err.message.includes('network')) {
          errorContent = "I'm having connection issues. Please check your internet and try again! 🌐";
        } else {
          errorContent = `Oops! ${err.message}. Please try again! 😅`;
        }
      }
      
      setError(err instanceof Error ? err.message : 'Something went wrong');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickMood = (mood: string) => {
    const moodMessages: Record<string, string> = {
      'happy': "I'm feeling happy and want to do something fun!",
      'chill': "I need to relax and unwind.",
      'bold': "I'm feeling adventurous and want to try something exciting!",
      'social': "I want to meet new people and have a social experience.",
    };
    
    sendMessage(moodMessages[mood] || `I'm feeling ${mood}.`);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'experience' && onViewExperience) {
      onViewExperience(suggestion.id);
    } else if (suggestion.type === 'retreat' && onViewRetreat) {
      onViewRetreat(suggestion.id);
    } else {
      // Fallback to navigation
      window.location.href = suggestion.booking_url;
    }
  };

  const handleSuggestionBook = (suggestion: any) => {
    window.location.href = suggestion.booking_url;
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* Floating Chat Button - Only show if not inline */}
      {!inline && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
          aria-label="Open AI Assistant"
        >
          <ChatBubbleLeftIcon className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Drawer/Interface */}
      {isOpen && (
        <div className={isMaximized ? "fixed inset-0 z-50 flex items-center justify-center" : (inline ? "relative w-full max-w-4xl mx-auto" : "fixed inset-0 z-50 flex justify-end")}>
          {/* Backdrop - Show if maximized or not inline */}
          {(isMaximized || !inline) && (
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => {
                if (isMaximized) setIsMaximized(false);
                else if (!inline) setIsOpen(false);
              }}
            />
          )}
          
          {/* Chat Panel */}
          <div className={`relative w-full ${isMaximized ? 'max-w-5xl h-[90vh] rounded-3xl overflow-hidden' : (inline ? 'max-w-4xl h-[240px]' : 'max-w-md h-full')} bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col ${inline && !isMaximized ? 'rounded-2xl overflow-hidden border border-gray-100' : ''}`}>
            {/* Header */}
            <div className={`flex items-center ${isMaximized ? 'justify-center' : 'justify-between'} p-3 border-b border-gray-100 bg-white relative`}>
              {isMaximized ? (
                <div className="absolute left-0 top-0 h-full flex items-center pl-3">
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <button
                        onClick={clearChat}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Clear chat"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Experiences by Vibe</h3>
                </div>
              )}
              {isMaximized && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Experiences by Vibe</h3>
                </div>
              )}
              {isMaximized ? (
                <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                  <button
                    onClick={() => setIsMaximized(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
              </div>
              ) : (
                <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Clear chat"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                )}
                  <button
                    onClick={() => setIsMaximized(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Maximize"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  {!inline && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Maximize"
                >
                      <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
                  )}
                  {!inline && (
                <button
                  onClick={() => setIsOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                      <XMarkIcon className="w-4 h-4" />
                </button>
                  )}
              </div>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">Hi, I'm Geetu- Your AI Mom!</h4>
                  
                  {/* Quick Mood Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleQuickMood(mood.value)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {mood.emoji} {mood.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      message.role === 'user' 
                        ? 'bg-yellow-500 text-white shadow-sm' 
                        : 'bg-gray-50 text-gray-900 border border-gray-100'
                    }`}>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {message.suggestions.map((suggestion, index) => (
                            <AISuggestionCard
                              key={index}
                              suggestion={suggestion}
                              onViewDetails={handleSuggestionClick}
                              onBook={handleSuggestionBook}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-3 py-2 max-w-[85%]">
                    <p className="text-xs text-red-800">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-gray-50 p-3">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tell me how you feel..."
                  disabled={isLoading}
                className="flex-1 text-xs bg-white border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg shadow-sm"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Quick Mood Buttons (when chat has messages) */}
              {messages.length > 0 && (
                  <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide">
                  {QUICK_MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handleQuickMood(mood.value)}
                      disabled={isLoading}
                       className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-200 hover:border-gray-300 disabled:border-gray-200 rounded-full text-xs font-semibold text-gray-800 disabled:text-gray-500 transition-all duration-200 hover:scale-105 active:scale-95 disabled:scale-100"
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
