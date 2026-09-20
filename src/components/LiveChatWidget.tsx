'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  Calendar, 
  Music, 
  Minimize2,
  Bot
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const { chatMessages, sendChatMessage, unreadChatCount, markChatAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      markChatAsRead();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText, 'client');
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    sendChatMessage(q, 'client');
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gold-gradient text-tartan-dark shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-yellow-300 ring-4 ring-black/30 group"
          title="Chat with Spud the Piper"
        >
          <MessageCircle className="w-7 h-7" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {unreadChatCount}
            </span>
          )}
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 text-xs font-bold uppercase tracking-wider">
            Chat with Spud
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-tartan-card border border-tartan-accent/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-tartan-navy to-tartan-dark px-5 py-4 border-b border-tartan-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold">
                  S
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-tartan-navy"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-serif">Spud the Piper • Live</h4>
                <p className="text-[11px] text-tartan-gold">Instant Inquiries & Diary Chat</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Prompts */}
          <div className="bg-tartan-dark/90 px-4 py-2 border-b border-tartan-border flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleQuickQuestion('How much for a wedding ceremony?')}
              className="bg-tartan-navy text-tartan-gold px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700"
            >
              💍 Wedding Pricing
            </button>
            <button
              onClick={() => handleQuickQuestion('Do you travel to the Highlands & Islands?')}
              className="bg-tartan-navy text-tartan-gold px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700"
            >
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Travel Area
            </button>
            <button
              onClick={() => handleQuickQuestion('Can you play Highland Cathedral?')}
              className="bg-tartan-navy text-tartan-gold px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700"
            >
              🎵 Tune Requests
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-tartan-dark/50 text-xs">
            {chatMessages.map((msg) => {
              const isMe = msg.sender === 'client';
              const isSpud = msg.sender === 'spud';
              const isBot = msg.sender === 'system';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                    {isBot && <Bot className="w-3 h-3 text-tartan-gold" />}
                    <span>{msg.senderName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-tartan-accent text-tartan-dark font-medium rounded-tr-none'
                        : isSpud
                        ? 'bg-tartan-navy border border-tartan-accent text-white rounded-tl-none'
                        : 'bg-slate-800/90 text-gray-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="bg-tartan-navy p-3 border-t border-tartan-border flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message for Spud..."
              className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
            />
            <button
              type="submit"
              className="p-2.5 bg-gold-gradient text-tartan-dark rounded-xl font-bold shadow-md hover:brightness-110 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
