'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Clock, 
  Check, 
  CheckCircle2,
  Smile, 
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  X,
  Radio,
  AlertCircle,
  Smartphone,
  Globe,
  Calendar,
  Layers,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { ChatMessage, QuickResponse, ChatSession } from '@/types/spud';

export const AdminMessageCenter: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage,
    chatSessions,
    activeChatSessionId,
    setActiveChatSessionId,
    markChatAsRead,
    markSessionResolved,
    deleteChatSession,
    clearAllChatHistory,
    isSpudOnline,
    toggleSpudOnline,
    setSpudOnline,
    quickResponses,
    addQuickResponse,
    updateQuickResponse,
    deleteQuickResponse,
    waitingChatSessionsCount,
    unreadChatCount
  } = useApp();

  const [replyText, setReplyText] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'waiting' | 'inquiries' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick Response Modal & Filter
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingQrId, setEditingQrId] = useState<string | null>(null);
  const [qrFormTitle, setQrFormTitle] = useState('');
  const [qrFormCategory, setQrFormCategory] = useState<QuickResponse['category']>('Weddings');
  const [qrFormText, setQrFormText] = useState('');

  // Active session object
  const activeSession = chatSessions.find(s => s.id === activeChatSessionId) || chatSessions[0];
  const currentSessionId = activeSession?.id || 'session-demo';

  // Filter messages for current active session
  const activeSessionMessages = chatMessages.filter(
    m => !m.sessionId || m.sessionId === currentSessionId
  );

  // Filter sessions list
  const filteredSessions = chatSessions.filter(s => {
    // Category filter
    if (sessionFilter === 'waiting' && !s.isWaitingForSpud) return false;
    if (sessionFilter === 'inquiries' && s.status !== 'offline_inquiry') return false;
    if (sessionFilter === 'resolved' && s.status !== 'resolved') return false;
    
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.visitorName.toLowerCase().includes(q);
      const matchMsg = s.lastMessage.toLowerCase().includes(q);
      const matchEmail = s.visitorEmail?.toLowerCase().includes(q);
      if (!matchName && !matchMsg && !matchEmail) return false;
    }
    return true;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendChatMessage(replyText, 'spud', currentSessionId);
    setReplyText('');
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
    markChatAsRead(sessionId);
  };

  const handleInsertQuickResponse = (content: string) => {
    setReplyText(content);
  };

  const handleOpenNewQrModal = () => {
    setEditingQrId(null);
    setQrFormTitle('');
    setQrFormCategory('Weddings');
    setQrFormText('');
    setIsQrModalOpen(true);
  };

  const handleOpenEditQrModal = (qr: QuickResponse) => {
    setEditingQrId(qr.id);
    setQrFormTitle(qr.title);
    setQrFormCategory(qr.category);
    setQrFormText(qr.text);
    setIsQrModalOpen(true);
  };

  const handleSaveQrForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrFormTitle.trim() || !qrFormText.trim()) return;

    if (editingQrId) {
      updateQuickResponse(editingQrId, {
        title: qrFormTitle.trim(),
        category: qrFormCategory,
        text: qrFormText.trim()
      });
    } else {
      addQuickResponse({
        title: qrFormTitle.trim(),
        category: qrFormCategory,
        text: qrFormText.trim()
      });
    }
    setIsQrModalOpen(false);
  };

  const categoriesList: { id: QuickResponse['category'] | 'all'; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'Weddings', label: '💍 Weddings' },
    { id: 'Pricing', label: '💷 Pricing & Deposits' },
    { id: 'Travel', label: '🗺️ Travel Radius' },
    { id: 'Attire', label: '👗 Attire & Tartans' },
    { id: 'Tunes', label: '🎵 Tunes & Music' },
    { id: 'Booking', label: '📅 Booking Diary' },
    { id: 'General', label: '💬 General' }
  ];

  const filteredQuickResponses = quickResponses.filter(q => {
    if (selectedCategoryFilter !== 'all' && q.category !== selectedCategoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-tartan-card p-6 rounded-3xl border border-tartan-border shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white font-serif">Live Message Center</h2>
            {waitingChatSessionsCount > 0 && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {waitingChatSessionsCount} Waiting for Reply
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time chat dispatch, multi-visitor queue management & canned quick replies
          </p>
        </div>

        {/* Spud Online / Offline Control Bar */}
        <div className="flex items-center gap-3 bg-tartan-dark/90 p-2 rounded-2xl border border-tartan-border">
          <div className="flex items-center gap-2 pl-3 pr-2">
            <span className={`w-3.5 h-3.5 rounded-full ${isSpudOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <div className="text-left">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Spud Status</span>
              <span className={`text-xs font-bold ${isSpudOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSpudOnline ? '🟢 Live & Online' : '🔴 Offline / Away'}
              </span>
            </div>
          </div>

          <button
            onClick={toggleSpudOnline}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow flex items-center gap-1.5 ${
              isSpudOnline 
                ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 border border-amber-500/40' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isSpudOnline ? 'Set Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sessions List (4 cols) - Middle Chat Stream (5 cols) - Right Intelligence (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1: SESSIONS & QUEUE (4 cols) ================= */}
        <div className="lg:col-span-4 bg-tartan-card rounded-3xl border border-tartan-border shadow-xl flex flex-col h-[650px] overflow-hidden">
          
          {/* Queue Filter Bar */}
          <div className="p-4 border-b border-tartan-border bg-tartan-navy space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-tartan-gold" />
                Conversations ({chatSessions.length})
              </span>
              <div className="flex items-center gap-2">
                {chatSessions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all chat conversations & reset for live testing?')) {
                        clearAllChatHistory();
                      }
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                    title="Purge test chat sessions"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="text-[11px] text-tartan-gold hover:text-white flex items-center gap-1 font-semibold"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Quick Responses
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[10px] bg-tartan-dark p-1 rounded-xl border border-tartan-border">
              <button
                onClick={() => setSessionFilter('all')}
                className={`py-1.5 px-2 rounded-lg font-bold text-center transition ${
                  sessionFilter === 'all' ? 'bg-tartan-accent text-tartan-dark' : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSessionFilter('waiting')}
                className={`py-1.5 px-1 rounded-lg font-bold text-center transition flex items-center justify-center gap-1 ${
                  sessionFilter === 'waiting' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300'
                }`}
              >
                Waiting {waitingChatSessionsCount > 0 && `(${waitingChatSessionsCount})`}
              </button>
              <button
                onClick={() => setSessionFilter('inquiries')}
                className={`py-1.5 px-1 rounded-lg font-bold text-center transition ${
                  sessionFilter === 'inquiries' ? 'bg-tartan-accent text-tartan-dark' : 'text-gray-400 hover:text-white'
                }`}
              >
                Inquiries
              </button>
              <button
                onClick={() => setSessionFilter('resolved')}
                className={`py-1.5 px-1 rounded-lg font-bold text-center transition ${
                  sessionFilter === 'resolved' ? 'bg-tartan-accent text-tartan-dark' : 'text-gray-400 hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients or messages..."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
              />
            </div>
          </div>

          {/* Sessions List Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-tartan-border/50 bg-tartan-dark/40">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <p className="font-semibold text-gray-300">No active conversations</p>
                <p className="text-[11px] text-gray-500">
                  {chatSessions.length === 0 
                    ? 'When a visitor chats or submits a question on the site, their conversation will appear here live in real-time.' 
                    : 'No conversations match this filter.'}
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === currentSessionId;
                const isWaiting = session.isWaitingForSpud;
                const isOfflineInquiry = session.status === 'offline_inquiry';
                const isResolved = session.status === 'resolved';

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 hover:bg-white/5 relative ${
                      isActive ? 'bg-tartan-accent/15 border-l-4 border-tartan-accent' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isOfflineInquiry 
                          ? 'bg-purple-900 text-purple-200' 
                          : isWaiting 
                          ? 'bg-amber-700 text-white' 
                          : 'bg-slate-700 text-gray-200'
                      }`}>
                        {session.visitorName.slice(0, 1).toUpperCase()}
                      </div>
                      {isWaiting && (
                        <span className="w-3 h-3 bg-red-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-tartan-navy animate-ping" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {session.visitorName}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {session.lastTimestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-300 truncate">
                        {session.lastMessage}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isWaiting && (
                          <span className="text-[9px] bg-red-600/30 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded font-bold">
                            Waiting for Spud
                          </span>
                        )}
                        {isOfflineInquiry && (
                          <span className="text-[9px] bg-purple-600/30 text-purple-300 border border-purple-500/50 px-1.5 py-0.5 rounded font-bold">
                            ✉️ Email Inquiry
                          </span>
                        )}
                        {isResolved && (
                          <span className="text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                            ✓ Resolved
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 truncate">
                          {session.ipOrLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>


        {/* ================= COLUMN 2: ACTIVE CHAT CONSOLE (5 cols) ================= */}
        <div className="lg:col-span-5 bg-tartan-card rounded-3xl border border-tartan-border shadow-xl flex flex-col h-[650px] overflow-hidden">
          
          {/* Active Session Header */}
          <div className="bg-tartan-navy p-4 border-b border-tartan-border flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                <User className="w-5 h-5 text-tartan-gold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {activeSession?.visitorName || 'Live Visitor'}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {activeSession?.visitorEmail || activeSession?.ipOrLocation || 'Online Session'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeSession?.status !== 'resolved' && (
                <button
                  onClick={() => activeSession && markSessionResolved(activeSession.id)}
                  className="px-2.5 py-1 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/70 border border-emerald-600/40 rounded-lg text-[11px] font-bold flex items-center gap-1"
                  title="Mark this conversation as answered & resolved"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-tartan-dark/50 text-xs">
            {activeSessionMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-600" />
                <p>No messages yet in this session.</p>
              </div>
            ) : (
              activeSessionMessages.map((msg) => {
                const isSpud = msg.sender === 'spud';
                const isBot = msg.sender === 'system';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSpud ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                      {isBot && <Bot className="w-3 h-3 text-tartan-gold" />}
                      <span className="font-bold">{msg.senderName}</span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                        isSpud
                          ? 'bg-gold-gradient text-tartan-dark font-semibold rounded-tr-none'
                          : isBot
                          ? 'bg-slate-800 text-gray-200 border border-slate-700 rounded-tl-none'
                          : 'bg-tartan-navy text-white border border-tartan-accent/40 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Canned Quick Responses Pill Strip */}
          <div className="bg-tartan-dark px-3 py-2 border-t border-tartan-border flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-tartan-gold font-bold shrink-0 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick:
            </span>
            {quickResponses.slice(0, 5).map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleInsertQuickResponse(qr.text)}
                className="bg-tartan-navy hover:bg-tartan-accent hover:text-tartan-dark text-gray-300 px-2.5 py-1 rounded-full border border-tartan-border whitespace-nowrap transition text-[11px]"
                title={qr.text}
              >
                {qr.title}
              </button>
            ))}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="text-tartan-gold hover:underline text-[11px] font-bold px-1.5 whitespace-nowrap"
            >
              + More
            </button>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="bg-tartan-navy p-3.5 border-t border-tartan-border flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to client as Spud the Piper..."
              className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>

        </div>


        {/* ================= COLUMN 3: VISITOR PROFILE & ACTIONS (3 cols) ================= */}
        <div className="lg:col-span-3 bg-tartan-card rounded-3xl p-5 border border-tartan-border shadow-xl space-y-5 h-[650px] overflow-y-auto">
          
          <div>
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
              <User className="w-4 h-4 text-tartan-gold" />
              Visitor Details
            </h3>
            <p className="text-[11px] text-gray-400">Contextual intelligence & actions</p>
          </div>

          {activeSession ? (
            <div className="space-y-3 text-xs">
              
              {/* Visitor Contact Info */}
              <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border space-y-2">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Client Name</span>
                  <strong className="text-white text-xs">{activeSession.visitorName}</strong>
                </div>

                {activeSession.visitorEmail && (
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Email</span>
                    <a 
                      href={`mailto:${activeSession.visitorEmail}`} 
                      className="text-tartan-gold hover:underline break-all block"
                    >
                      {activeSession.visitorEmail}
                    </a>
                  </div>
                )}

                {activeSession.visitorPhone && (
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Phone</span>
                    <a 
                      href={`tel:${activeSession.visitorPhone}`} 
                      className="text-emerald-400 hover:underline block font-semibold"
                    >
                      {activeSession.visitorPhone}
                    </a>
                  </div>
                )}

                {activeSession.eventDate && (
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Event Date</span>
                    <span className="text-amber-300 font-semibold">{activeSession.eventDate}</span>
                  </div>
                )}

                {activeSession.eventType && (
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Event Type</span>
                    <span className="text-white">{activeSession.eventType}</span>
                  </div>
                )}
              </div>

              {/* Technical / Source info */}
              <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-tartan-gold" /> Page:
                  </span>
                  <span className="text-white font-medium">{activeSession.activePage || 'Home'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-tartan-gold" /> Device:
                  </span>
                  <span className="text-white font-medium">{activeSession.device || 'Web Browser'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-tartan-border">
                {activeSession.visitorEmail && (
                  <a
                    href={`mailto:${activeSession.visitorEmail}?subject=Regarding Your Bagpipe Inquiry - Spud the Piper`}
                    className="w-full py-2 bg-tartan-navy hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-tartan-border transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Send Follow-Up Email</span>
                  </a>
                )}

                {activeSession.visitorPhone && (
                  <a
                    href={`tel:${activeSession.visitorPhone}`}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Phone</span>
                  </a>
                )}

                <button
                  onClick={() => markSessionResolved(activeSession.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Session Resolved</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete the chat thread for ${activeSession.visitorName}?`)) {
                      deleteChatSession(activeSession.id);
                    }
                  }}
                  className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-900/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Thread</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-xs">
              Select a conversation to inspect visitor details.
            </div>
          )}

        </div>

      </div>


      {/* ================= MODAL: QUICK RESPONSES STUDIO ================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-tartan-navy p-5 border-b border-tartan-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-tartan-gold" />
                  Quick Responses & Canned Replies Studio
                </h3>
                <p className="text-xs text-gray-400">
                  Manage instant reply templates to answer wedding, pricing, and tune inquiries with 1 click
                </p>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Form: Add or Edit Quick Response */}
              <form onSubmit={handleSaveQrForm} className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                    {editingQrId ? 'Edit Quick Response' : 'Create New Quick Response'}
                  </h4>
                  {editingQrId && (
                    <button
                      type="button"
                      onClick={handleOpenNewQrModal}
                      className="text-xs text-gray-400 hover:text-white underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Title / Button Label *</label>
                    <input
                      type="text"
                      required
                      value={qrFormTitle}
                      onChange={(e) => setQrFormTitle(e.target.value)}
                      placeholder="e.g. Castle Wedding Package"
                      className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Category</label>
                    <select
                      value={qrFormCategory}
                      onChange={(e) => setQrFormCategory(e.target.value as QuickResponse['category'])}
                      className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tartan-accent"
                    >
                      <option value="Weddings">💍 Weddings</option>
                      <option value="Pricing">💷 Pricing</option>
                      <option value="Travel">🗺️ Travel</option>
                      <option value="Attire">👗 Attire</option>
                      <option value="Tunes">🎵 Tunes</option>
                      <option value="Booking">📅 Booking</option>
                      <option value="General">💬 General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Full Response Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={qrFormText}
                    onChange={(e) => setQrFormText(e.target.value)}
                    placeholder="Type the exact canned reply text Spud will send..."
                    className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingQrId ? 'Update Quick Response' : 'Save Quick Response'}</span>
                  </button>
                </div>
              </form>

              {/* List of Existing Quick Responses */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Existing Responses ({filteredQuickResponses.length})
                  </h4>
                  
                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-tartan-dark border border-tartan-border rounded-lg px-2.5 py-1 text-[11px] text-gray-300 focus:outline-none"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {filteredQuickResponses.map((qr) => (
                    <div
                      key={qr.id}
                      className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{qr.title}</span>
                          <span className="text-[10px] bg-tartan-navy text-tartan-gold px-2 py-0.5 rounded-full border border-tartan-border">
                            {qr.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{qr.text}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            handleInsertQuickResponse(qr.text);
                            setIsQrModalOpen(false);
                          }}
                          className="px-2.5 py-1 bg-tartan-accent text-tartan-dark font-bold text-[11px] rounded-lg hover:brightness-110"
                          title="Insert into chat reply input"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => handleOpenEditQrModal(qr)}
                          className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete quick response "${qr.title}"?`)) {
                              deleteQuickResponse(qr.id);
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-tartan-navy px-6 py-3 border-t border-tartan-border flex justify-end">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2 bg-tartan-dark text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-tartan-border"
              >
                Close Studio
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
