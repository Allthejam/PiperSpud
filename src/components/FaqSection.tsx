'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { EditableElement } from './EditableElement';
import { useApp } from '@/context/AppContext';

interface FaqSectionProps {
  showOnlyHome?: boolean;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ showOnlyHome = true }) => {
  const { faqs } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const displayFaqs = showOnlyHome 
    ? faqs.filter(f => f.showOnHome !== false)
    : faqs;

  const filteredFaqs = displayFaqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 bg-tartan-card relative border-b border-tartan-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <EditableElement
              id="faq-header-badge"
              tag="span"
              defaultContent="Got Questions?"
              label="FAQ Header Badge"
              section="faq"
            />
          </div>
          <EditableElement
            id="faq-header-title"
            tag="h2"
            defaultContent="Frequently Asked Questions"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="FAQ Header Title"
            section="faq"
          />
          <EditableElement
            id="faq-header-desc"
            tag="p"
            defaultContent="Everything you need to know about booking Spud the Piper, payment workflows, travel radius, and custom musical arrangements."
            className="text-sm sm:text-base text-gray-300"
            label="FAQ Header Description"
            section="faq"
          />
        </div>

        {/* FAQ Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions (e.g. deposit, tartan, travel, wedding)..."
            className="w-full bg-tartan-dark border border-tartan-border rounded-2xl px-5 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent shadow-inner"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-tartan-dark/90 rounded-2xl border transition-all overflow-hidden shadow-md ${
                  isOpen ? 'border-tartan-gold ring-1 ring-tartan-gold/30' : 'border-tartan-border/70 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-base sm:text-lg font-bold text-white font-serif">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-full bg-tartan-navy text-tartan-gold shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-sm text-gray-300 leading-relaxed border-t border-slate-800/80 pt-4">
                    <p>{faq.answer}</p>
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-tartan-gold bg-tartan-navy px-2.5 py-1 rounded-md border border-tartan-accent/30">
                        Category: {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Chat Prompt Bottom */}
        <div className="mt-12 text-center p-6 bg-tartan-navy/60 rounded-3xl border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h4 className="text-sm font-bold text-white font-serif">Still have a specific question?</h4>
            <p className="text-xs text-gray-300">Spud is ready to assist you right now via live chat or phone.</p>
          </div>
          <a
            href="tel:07793491367"
            className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call 07793 491367</span>
          </a>
        </div>

      </div>
    </section>
  );
};
