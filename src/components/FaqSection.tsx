'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle, Phone } from 'lucide-react';
import { EditableElement } from './EditableElement';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FaqItem[] = [
    {
      question: 'How do bookings and deposits work with Spud?',
      answer: 'You can check open dates and submit a provisional booking request on our interactive calendar. Spud will review the details in his diary and approve it. Once approved, you will receive an official Brevo email containing your invoice and a secure PayPal link to pay the deposit (£50 - £150 depending on event). As soon as the deposit is received via PayPal, your date is 100% locked in.',
      category: 'Booking & Payments'
    },
    {
      question: 'How far does Spud travel?',
      answer: 'Spud is based in Scotland and regularly performs in Edinburgh, Glasgow, Inverness, Stirling, Aberdeen, Perth, the Scottish Borders, and the Western Isles (Skye, Mull, Harris). Spud also frequently travels across the wider UK, Europe, the United States, and worldwide for destination weddings and corporate galas.',
      category: 'Travel & Locations'
    },
    {
      question: 'Can I choose what tartan or uniform Spud wears?',
      answer: 'Yes, absolutely! Spud offers several authentic Scottish Highland dress styles: Full Ceremonial Number 1 Military Dress with Feather Bonnet and Plaid, Royal Stewart Tartan (Crimson Red), Black Watch Government Tartan (Navy/Forest Green), and Modern Highland Day Tweed. You can select your preference in the booking form.',
      category: 'Attire & Dress Code'
    },
    {
      question: 'Can I request specific bagpipe tunes for my wedding or event?',
      answer: 'Yes! Spud has an extensive repertoire ranging from traditional wedding processional anthems (Highland Cathedral, Scotland the Brave, Mairi\'s Wedding) to solemn laments (Amazing Grace, Flowers of the Forest, Going Home) and modern popular melodies. If you have a custom song request, let Spud know during booking!',
      category: 'Music & Repertoire'
    },
    {
      question: 'What happens if it rains or there is bad Scottish weather?',
      answer: 'Highland bagpipes and professional Scottish pipers are well-accustomed to Scottish weather! Spud can perform outdoors in light rain or seamlessly adapt to indoor ceremony halls, church foyers, castle archways, and covered marquee entrances.',
      category: 'Event Logistics'
    },
    {
      question: 'What is the "Highland Bagpipe Experience" and where can it take place?',
      answer: 'The Highland Bagpipe Experience is an interactive, hands-on workshop led by Spud the Piper. Perfect for tour groups, holidaymakers, families, stag/hen parties, and Airbnb/holiday home guests. Spud brings practice chanters so everyone learns to finger the Scottish scale, gives each guest a shot at playing the Great Highland Bagpipe, plays a close-up private concert, and poses for photos in full ceremonial kilt regalia. Spud can travel to your rental cottage, lodge, Airbnb, hotel, castle, or outdoor venue anywhere in Scotland.',
      category: 'Highland Experience'
    },
    {
      question: 'When is the remaining balance due after the deposit?',
      answer: 'The remaining balance after the deposit can be settled prior to the event date or on the day of the performance via bank transfer, card, or cash as preferred.',
      category: 'Booking & Payments'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
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
