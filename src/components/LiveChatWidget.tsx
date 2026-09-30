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
  HelpCircle,
  Radio
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
  const [visitorSessionId, setVisitorSessionId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('spud_the_piper_visitor_session_id');
      if (!storedId) {
        storedId = `session-visitor-${Date.now()}`;
        localStorage.setItem('spud_the_piper_visitor_session_id', storedId);
      }
      setVisitorSessionId(storedId);
    }
  }, []);

  const visitorMessages = chatMessages.filter(m => {
    if (!m) return false;
    if (!visitorSessionId) return true;
    return !m.sessionId || m.sessionId === visitorSessionId;
  });

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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, visitorMessages.length, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat' && unreadChatCount > 0) {
      markChatAsRead(visitorSessionId || undefined);
    }
  }, [isOpen, activeTab, unreadChatCount, markChatAsRead, visitorSessionId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText, 'client', visitorSessionId || undefined);
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    sendChatMessage(q, 'client', visitorSessionId || undefined);
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
      {/* ================= FLOATING TRIGGER BUTTON & STATUS BADGE ================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 group">
          
          {/* Teaser pill / status chip */}
          <div 
            onClick={() => setIsOpen(true)}
            className={`cursor-pointer px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 ${
              isSpudOnline 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' 
                : 'bg-red-950/90 border-red-500/50 text-red-300'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSpudOnline ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isSpudOnline ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
            </span>
            <span>{isSpudOnline ? 'Spud is Online' : 'Spud is Offline'}</span>
          </div>

          {/* Main Floating Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-full bg-gold-gradient text-tartan-dark shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-yellow-300 ring-4 ring-black/40"
            title={isSpudOnline ? "Spud is ONLINE • Chat live now" : "Spud is OFFLINE • Leave a question"}
          >
            <div className="relative">
              <MessageCircle className="w-7 h-7" />
              <span 
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-tartan-dark shadow ${
                  isSpudOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-600'
                }`} 
              />
            </div>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow">
                {unreadChatCount}
              </span>
            )}
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 text-xs font-extrabold uppercase tracking-wider">
              {isSpudOnline ? 'Chat with Spud' : 'Email / Ask Spud'}
            </span>
          </button>
        </div>
      )}

      {/* ================= FLOATING CHAT WINDOW ================= */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-tartan-card border border-tartan-accent/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[580px] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-tartan-navy to-tartan-dark px-5 py-4 border-b border-tartan-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-lg shadow-inner border border-yellow-300/40">
                  S
                </div>
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-tartan-navy shadow ${
                    isSpudOnline ? 'bg-emerald-500 ring-2 ring-emerald-400/40 animate-pulse' : 'bg-red-600 ring-2 ring-red-400/40'
                  }`} 
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-serif">
                    Spud the Piper
                  </h4>
                  {/* PROMINENT ONLINE / OFFLINE BADGE */}
                  <span className={`text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full font-black border flex items-center gap-1 ${
                    isSpudOnline 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpudOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {isSpudOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-medium">
                  {isSpudOnline ? '🟢 Live & Ready to Chat' : '🔴 Away at an event • Leave a question'}
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

          {/* HIGH VISIBILITY STATUS BANNER */}
          <div className={`px-4 py-2 border-b text-[11px] flex items-center justify-between ${
            isSpudOnline
              ? 'bg-emerald-950/80 border-emerald-600/30 text-emerald-200'
              : 'bg-red-950/90 border-red-600/40 text-red-200'
          }`}>
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className={`w-3.5 h-3.5 shrink-0 ${isSpudOnline ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              {isSpudOnline 
                ? 'Spud is ONLINE: Instant live replies.' 
                : 'Spud is OFFLINE: Away playing pipes.'}
            </span>
            {!isSpudOnline && activeTab !== 'inquiry' && (
              <button
                onClick={() => setActiveTab('inquiry')}
                className="text-[11px] text-tartan-gold underline font-bold hover:text-white ml-2 whitespace-nowrap"
              >
                Email Form &rarr;
              </button>
            )}
          </div>

          {/* Navigation Tabs (Live Chat vs Email/Ask Us) */}
          <div className="bg-tartan-dark/95 border-b border-tartan-border grid grid-cols-2 p-1.5 gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
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
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
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
                {visitorMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-tartan-navy border border-tartan-accent/50 flex items-center justify-center text-tartan-gold font-serif font-bold text-xl shadow-lg">
                      S
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">Failte! Welcome to Spud&apos;s Live Chat</h4>
                      <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
                        {isSpudOnline 
                          ? "Spud is online now. Ask any question about wedding ceremonies, dates, castle galas, tartans, or tune requests!"
                          : "Spud is currently offline at an event. Type your question below or switch to 'Email Us' and Spud will reply to your email."}
                      </p>
                    </div>
                  </div>
                ) : (
                  visitorMessages.map((msg) => {
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
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSend} className="bg-tartan-navy p-3 border-t border-tartan-border flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isSpudOnline ? "Type your message (Spud is online)..." : "Type your question (saved for Spud)..."}
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
