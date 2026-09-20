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
  Smile, 
  Phone 
} from 'lucide-react';
import { ChatMessage } from '@/types/spud';

export const AdminMessageCenter: React.FC = () => {
  const { chatMessages, sendChatMessage } = useApp();
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendChatMessage(replyText, 'spud');
    setReplyText('');
  };

  const quickCannedReplies = [
    "Aye! I am available for that date. You can request a hold on our booking diary.",
    "I'd be delighted to pipe for your wedding. Standard package includes greeting guests and piping the bride down the aisle.",
    "For travel to the Highlands, standard rate plus reasonable mileage applies.",
    "Feel free to give me a quick ring directly on 07793 491367 so we can talk through tune choices!"
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white font-serif">Live Message Center</h2>
        <p className="text-xs text-gray-400">Two-way real-time communication console with website visitors and clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Chat Stream Window */}
        <div className="lg:col-span-8 bg-tartan-card rounded-3xl border border-tartan-border shadow-2xl flex flex-col h-[600px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-tartan-navy p-4 border-b border-tartan-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                  <User className="w-5 h-5" />
                </div>
                <span className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-tartan-navy"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Visitor Session</h4>
                <p className="text-[11px] text-gray-400">Online now from Edinburgh, Scotland</p>
              </div>
            </div>

            <div className="text-xs text-tartan-gold font-bold bg-tartan-dark px-3 py-1 rounded-full border border-tartan-accent/30">
              Active Channel
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-tartan-dark/50 text-xs">
            {chatMessages.map((msg) => {
              const isSpud = msg.sender === 'spud';
              const isBot = msg.sender === 'system';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSpud ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-400">
                    {isBot && <Bot className="w-3 h-3 text-tartan-gold" />}
                    <span className="font-bold">{msg.senderName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 leading-relaxed shadow-md ${
                      isSpud
                        ? 'bg-gold-gradient text-tartan-dark font-semibold rounded-tr-none'
                        : isBot
                        ? 'bg-slate-800 text-gray-200 border border-slate-700 rounded-tl-none'
                        : 'bg-tartan-navy text-white border border-tartan-accent/50 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canned Quick Replies bar */}
          <div className="bg-tartan-dark px-4 py-2 border-t border-tartan-border flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-tartan-gold font-bold shrink-0">Quick Responses:</span>
            {quickCannedReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => setReplyText(reply)}
                className="bg-tartan-navy text-gray-300 hover:text-white px-3 py-1 rounded-full border border-tartan-border whitespace-nowrap hover:bg-slate-700"
              >
                {reply.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="bg-tartan-navy p-4 border-t border-tartan-border flex items-center gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to client as Spud the Piper..."
              className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send Reply</span>
            </button>
          </form>

        </div>

        {/* Right: Visitor Profile & Context */}
        <div className="lg:col-span-4 bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-6">
          <h3 className="text-base font-bold text-white font-serif">Visitor Intelligence</h3>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border space-y-1">
              <span className="text-gray-500 font-semibold block">Active Page:</span>
              <strong className="text-tartan-gold">Booking Diary & Calendar</strong>
            </div>

            <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border space-y-1">
              <span className="text-gray-500 font-semibold block">Referral Source:</span>
              <span className="text-white">Google Organic Search (&quot;Wedding Bagpiper Scotland&quot;)</span>
            </div>

            <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border space-y-1">
              <span className="text-gray-500 font-semibold block">Device Type:</span>
              <span className="text-white">Apple iPhone (PWA Ready)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-tartan-border space-y-2">
            <p className="text-xs font-bold text-tartan-gold">Direct Follow Up:</p>
            <a
              href="tel:07793491367"
              className="w-full py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>Call on Phone</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
