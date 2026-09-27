'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Sparkles,
  Layers,
  X,
  Check,
  Save,
  Home
} from 'lucide-react';
import { FaqItem } from '@/types/spud';

const FAQ_CATEGORIES = [
  'Booking & Payments',
  'Travel & Locations',
  'Attire & Dress Code',
  'Music & Repertoire',
  'Highland Experience',
  'Event Logistics',
  'General & Custom'
];

export const AdminFaqs: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('Booking & Payments');
  const [formShowOnHome, setFormShowOnHome] = useState(true);

  // Filtered FAQs
  const filteredFaqs = faqs.filter(f => {
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    const matchesSearch = 
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const homeCount = faqs.filter(f => f.showOnHome !== false).length;

  const handleOpenAddModal = () => {
    setEditingFaqId(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('Booking & Payments');
    setFormShowOnHome(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category || 'Booking & Payments');
    setFormShowOnHome(faq.showOnHome !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;

    if (editingFaqId) {
      await updateFaq(editingFaqId, {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        showOnHome: formShowOnHome
      });
    } else {
      await addFaq({
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        showOnHome: formShowOnHome
      });
    }

    setIsModalOpen(false);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const list = [...faqs];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    await reorderFaqs(list);
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;
    const list = [...faqs];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    await reorderFaqs(list);
  };

  const handleToggleHome = async (faq: FaqItem) => {
    await updateFaq(faq.id, { showOnHome: !faq.showOnHome });
  };

  const handleDelete = async (id: string, question: string) => {
    if (window.confirm(`Are you sure you want to delete this FAQ?\n\n"${question}"`)) {
      await deleteFaq(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Frequently Asked Questions (FAQ) Manager</h2>
          <p className="text-xs text-gray-400">Control questions displayed on the Home Page and dedicated FAQ Knowledgebase page</p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-emerald-400 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-800/80 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Firestore Live Sync
          </span>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <span className="text-xs text-gray-400 font-medium">Total Questions</span>
          <p className="text-2xl font-extrabold text-white font-serif">{faqs.length}</p>
          <p className="text-[11px] text-gray-400">Across {FAQ_CATEGORIES.length} Categories</p>
        </div>
        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Shown on Home Page</span>
            <Home className="w-4 h-4 text-tartan-gold" />
          </div>
          <p className="text-2xl font-extrabold text-tartan-gold font-serif">{homeCount}</p>
          <p className="text-[11px] text-gray-400">Main website landing section</p>
        </div>
        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Cloud Database</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-base font-bold text-emerald-300 font-serif">faqs collection</p>
          <p className="text-[11px] text-gray-400">Auto-syncs across all devices live</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-tartan-card rounded-2xl p-4 border border-tartan-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-tartan-gold text-tartan-dark shadow'
                : 'bg-tartan-navy text-gray-300 hover:bg-slate-700 border border-tartan-border'
            }`}
          >
            All ({faqs.length})
          </button>
          {FAQ_CATEGORIES.map(cat => {
            const count = faqs.filter(f => f.category === cat).length;
            if (count === 0 && filterCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-tartan-gold text-tartan-dark shadow'
                    : 'bg-tartan-navy text-gray-300 hover:bg-slate-700 border border-tartan-border'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Cards List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-tartan-card rounded-3xl border border-tartan-border text-gray-400 text-xs space-y-3">
            <HelpCircle className="w-10 h-10 text-tartan-gold mx-auto opacity-60" />
            <p className="font-bold text-white text-sm">No Questions Found</p>
            <p className="text-gray-400 max-w-sm mx-auto">
              No FAQ questions match your current search or category filter.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-tartan-navy text-tartan-gold rounded-xl border border-tartan-border font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First FAQ</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isShownOnHome = faq.showOnHome !== false;

            return (
              <div
                key={faq.id}
                className="bg-tartan-card rounded-2xl p-5 border border-tartan-border hover:border-tartan-accent/60 transition-all space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Category & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-tartan-navy text-tartan-gold text-[11px] font-bold border border-tartan-border">
                      {faq.category}
                    </span>
                    <button
                      onClick={() => handleToggleHome(faq)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
                        isShownOnHome
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-gray-400 border-slate-700'
                      }`}
                      title="Click to toggle visibility on Home Page"
                    >
                      {isShownOnHome ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                      <span>{isShownOnHome ? 'Shown on Home Page' : 'FAQ Page Only'}</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Re-order buttons */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white disabled:opacity-30 border border-tartan-border"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white disabled:opacity-30 border border-tartan-border"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEditModal(faq)}
                      className="px-3 py-1.5 rounded-lg bg-tartan-navy hover:bg-slate-700 text-tartan-gold text-xs font-bold border border-tartan-border flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question & Answer Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                    <span className="text-tartan-gold">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed pl-6 border-l-2 border-tartan-gold/40">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    {editingFaqId ? 'Edit FAQ Question' : 'Add New FAQ Question'}
                  </h3>
                  <p className="text-[11px] text-gray-400">Syncs immediately across website & knowledgebase</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. How far does Spud travel for castle events?"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-tartan-accent"
                >
                  {FAQ_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Detailed Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide a clear, courteous, and informative answer for your clients..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-tartan-dark rounded-xl border border-tartan-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-tartan-gold" />
                    Display on Home Page Section
                  </span>
                  <p className="text-[11px] text-gray-400">Highlight this question in the main landing FAQ accordion</p>
                </div>
                <input
                  type="checkbox"
                  checked={formShowOnHome}
                  onChange={(e) => setFormShowOnHome(e.target.checked)}
                  className="w-5 h-5 accent-tartan-accent rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-tartan-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingFaqId ? 'Save Changes' : 'Publish Question'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
