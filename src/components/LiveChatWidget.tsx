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
  Bot,
  Mail,
  CheckCircle2,
  Clock,
  User,
  HelpCircle
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    unreadChatCount, 
    markChatAsRead,
    isSpudOnline,
    submitOfflineInquiry
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'inquiry'>('chat');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Offline / Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEventDate, setInquiryEventDate] = useState('');
  const [inquiryEventType, setInquiryEventType] = useState('Wedding');
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      markChatAsRead();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatMessages, activeTab, markChatAsRead]);

  // When Spud goes offline while open, we can give a friendly prompt
  useEffect(() => {
    if (!isSpudOnline && isOpen && !inquirySubmitted) {
      // Optional: keep current tab or gently suggest offline inquiry
    }
  }, [isSpudOnline, isOpen, inquirySubmitted]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText, 'client');
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    sendChatMessage(q, 'client');
  };

  const handleOfflineInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryQuestion.trim()) return;

    submitOfflineInquiry({
      name: inquiryName.trim(),
      email: inquiryEmail.trim(),
      phone: inquiryPhone.trim() || undefined,
      eventDate: inquiryEventDate || undefined,
      eventType: inquiryEventType,
      question: inquiryQuestion.trim()
    });

    setInquirySubmitted(true);
  };

  const resetInquiryForm = () => {
    setInquiryName('');
    setInquiryEmail('');
    setInquiryPhone('');
    setInquiryEventDate('');
    setInquiryQuestion('');
    setInquirySubmitted(false);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gold-gradient text-tartan-dark shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-yellow-300 ring-4 ring-black/30 group"
          title={isSpudOnline ? "Chat live with Spud the Piper" : "Leave a question for Spud the Piper"}
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span 
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-tartan-dark ${
                isSpudOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`} 
              title={isSpudOnline ? 'Spud is Online' : 'Spud is Offline'}
            />
          </div>
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {unreadChatCount}
            </span>
          )}
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 text-xs font-bold uppercase tracking-wider">
            {isSpudOnline ? 'Chat with Spud' : 'Email / Ask Spud'}
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-tartan-card border border-tartan-accent/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[560px] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-tartan-navy to-tartan-dark px-5 py-3.5 border-b border-tartan-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-base shadow-inner">
                  S
                </div>
                <span 
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-tartan-navy ${
                    isSpudOnline ? 'bg-emerald-500 ring-2 ring-emerald-400/30' : 'bg-red-500 ring-2 ring-red-400/30'
                  }`} 
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                  Spud the Piper
                  <span className={`text-[9px] uppercase font-sans tracking-wider px-1.5 py-0.5 rounded font-extrabold ${
                    isSpudOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isSpudOnline ? 'Online' : 'Offline'}
                  </span>
                </h4>
                <p className="text-[11px] text-gray-300">
                  {isSpudOnline ? '🟢 Live & Ready to Chat' : '🔴 Away at event • Leave a question'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Live Chat vs Email/Ask Us) */}
          <div className="bg-tartan-dark/95 border-b border-tartan-border grid grid-cols-2 p-1 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-tartan-accent text-tartan-dark shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Live Chat</span>
              {unreadChatCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1 rounded-full">{unreadChatCount}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inquiry')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'inquiry'
                  ? 'bg-tartan-accent text-tartan-dark shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Us / Question</span>
            </button>
          </div>

          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <>
              {/* Offline Warning Banner inside Chat if Offline */}
              {!isSpudOnline && (
                <div className="bg-amber-950/70 border-b border-amber-600/30 px-3.5 py-2 flex items-center justify-between text-[11px] text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Spud is offline. Messages are recorded for direct reply.
                  </span>
                  <button
                    onClick={() => setActiveTab('inquiry')}
                    className="underline text-tartan-gold font-bold hover:text-white ml-2 whitespace-nowrap"
                  >
                    Leave Details
                  </button>
                </div>
              )}

              {/* Quick FAQ Prompts */}
              <div className="bg-tartan-dark/80 px-3 py-1.5 border-b border-tartan-border flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                <button
                  onClick={() => handleQuickQuestion('How much for a wedding ceremony?')}
                  className="bg-tartan-navy text-tartan-gold hover:text-white px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700 transition"
                >
                  💍 Wedding Pricing
                </button>
                <button
                  onClick={() => handleQuickQuestion('Do you travel to the Highlands & Islands?')}
                  className="bg-tartan-navy text-tartan-gold hover:text-white px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700 transition"
                >
                  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Travel Radius
                </button>
                <button
                  onClick={() => handleQuickQuestion('Can you play Highland Cathedral?')}
                  className="bg-tartan-navy text-tartan-gold hover:text-white px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700 transition"
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
                  placeholder={isSpudOnline ? "Type your message for Spud..." : "Type your question (we'll save it)..."}
                  className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-gold-gradient text-tartan-dark rounded-xl font-bold shadow-md hover:brightness-110 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: EMAIL US / LEAVE QUESTION (OFFLINE FORM) */}
          {activeTab === 'inquiry' && (
            <div className="flex-1 p-5 overflow-y-auto bg-tartan-dark/70 text-xs">
              {inquirySubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">Message Received!</h3>
                    <p className="text-xs text-gray-300 mt-1 max-w-xs">
                      Thank you, <strong className="text-tartan-gold">{inquiryName}</strong>. Your inquiry has been sent straight to Spud&apos;s Live Message Center.
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Spud will reply to <strong className="text-white">{inquiryEmail}</strong> as soon as he steps off the pipes.
                    </p>
                  </div>
                  <button
                    onClick={resetInquiryForm}
                    className="px-4 py-2 bg-tartan-navy text-tartan-gold hover:text-white rounded-xl border border-tartan-border text-xs font-bold"
                  >
                    Send Another Question
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOfflineInquirySubmit} className="space-y-3.5">
                  <div className="bg-tartan-navy/60 p-3 rounded-xl border border-tartan-border/60 mb-2">
                    <p className="text-xs font-semibold text-tartan-gold flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Direct Inquiry to Spud
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      Need a quote or specific tune advice? Leave your question and Spud will email you back shortly.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Fiona Campbell"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="fiona@example.com"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="07..."
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Event Type</label>
                      <select
                        value={inquiryEventType}
                        onChange={(e) => setInquiryEventType(e.target.value)}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tartan-accent"
                      >
                        <option value="Wedding">Wedding Ceremony</option>
                        <option value="Funeral">Funeral / Memorial</option>
                        <option value="Corporate">Corporate / Castle Gala</option>
                        <option value="Birthday">Birthday / Anniversary</option>
                        <option value="Burns Night">Burns Night Supper</option>
                        <option value="General">General Question</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Event Date (Approx)</label>
                      <input
                        type="date"
                        value={inquiryEventDate}
                        onChange={(e) => setInquiryEventDate(e.target.value)}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Your Question or Note *</label>
                    <textarea
                      required
                      rows={3}
                      value={inquiryQuestion}
                      onChange={(e) => setInquiryQuestion(e.target.value)}
                      placeholder="Ask about venue travel, tune requests, timings, or packages..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Question to Spud</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      )}
    </>
  );
};
