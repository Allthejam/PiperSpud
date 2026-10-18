'use client';

import React, { useState, useRef } from 'react';
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
  Home,
  RefreshCw,
  AlertTriangle,
  List,
  ListOrdered,
  Bold,
  Pilcrow
} from 'lucide-react';
import { FaqItem } from '@/types/spud';
import { FormattedFaqAnswer } from '@/components/FormattedFaqAnswer';

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
  const { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs, restoreDefaultFaqs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isRestoring, setIsRestoring] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('Booking & Payments');
  const [formShowOnHome, setFormShowOnHome] = useState(true);
  const [activeEditorTab, setActiveEditorTab] = useState<'write' | 'preview'>('write');
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert formatting into the answer textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = answerTextareaRef.current;
    if (!textarea) {
      setFormAnswer((prev) => prev + prefix + defaultPlaceholder + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formAnswer.substring(start, end);
    const textToInsert = selectedText || defaultPlaceholder;

    const newText = formAnswer.substring(0, start) + prefix + textToInsert + suffix + formAnswer.substring(end);
    setFormAnswer(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + textToInsert.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 0);
  };

  const insertBullet = () => {
    const textarea = answerTextareaRef.current;
    if (!textarea) {
      setFormAnswer((prev) => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '• ');
      return;
    }
    const start = textarea.selectionStart;
    const before = formAnswer.substring(0, start);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    insertFormatting(needsNewline ? '\n• ' : '• ', '', 'New bullet item');
  };

  const insertNumbered = () => {
    const textarea = answerTextareaRef.current;
    if (!textarea) {
      setFormAnswer((prev) => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '1. ');
      return;
    }
    const start = textarea.selectionStart;
    const before = formAnswer.substring(0, start);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    insertFormatting(needsNewline ? '\n1. ' : '1. ', '', 'First numbered item');
  };

  const insertParagraph = () => {
    insertFormatting('\n\n', '', 'New paragraph text');
  };

  const insertBold = () => {
    insertFormatting('**', '**', 'bold text');
  };

  const handleAnswerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const textBeforeCursor = formAnswer.substring(0, start);
      const currentLine = textBeforeCursor.split('\n').pop() || '';

      // Check if current line starts with bullet
      const bulletMatch = currentLine.match(/^\s*([•\-\*·–]|\u2022)\s*(.*)$/);
      if (bulletMatch) {
        e.preventDefault();
        // If bullet line is empty (just the bullet symbol), pressing enter clears the bullet line
        if (!bulletMatch[2].trim()) {
          const lineStart = start - currentLine.length;
          const newText = formAnswer.substring(0, lineStart) + formAnswer.substring(start);
          setFormAnswer(newText);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
          return;
        }
        // Otherwise continue bullet on next line
        const bulletSymbol = bulletMatch[1];
        const newText = formAnswer.substring(0, start) + '\n' + bulletSymbol + ' ' + formAnswer.substring(start);
        setFormAnswer(newText);
        setTimeout(() => {
          const newPos = start + 1 + bulletSymbol.length + 1;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      // Check if current line starts with numbered list
      const numMatch = currentLine.match(/^\s*(\d+)[\.\)]\s*(.*)$/);
      if (numMatch) {
        e.preventDefault();
        if (!numMatch[2].trim()) {
          const lineStart = start - currentLine.length;
          const newText = formAnswer.substring(0, lineStart) + formAnswer.substring(start);
          setFormAnswer(newText);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
          return;
        }
        const nextNum = parseInt(numMatch[1], 10) + 1;
        const newText = formAnswer.substring(0, start) + '\n' + nextNum + '. ' + formAnswer.substring(start);
        setFormAnswer(newText);
        setTimeout(() => {
          const newPos = start + 1 + `${nextNum}. `.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
    }
  };

  // Filtered FAQs
  const filteredFaqs = (faqs || []).filter(f => {
    if (!f) return false;
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    const q = (searchTerm || '').toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch = 
      (f.question || '').toLowerCase().includes(q) ||
      (f.answer || '').toLowerCase().includes(q) ||
      (f.category || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const homeCount = (faqs || []).filter(f => f && f.showOnHome !== false).length;

  const handleOpenAddModal = () => {
    setEditingFaqId(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('Booking & Payments');
    setFormShowOnHome(true);
    setActiveEditorTab('write');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category || 'Booking & Payments');
    setFormShowOnHome(faq.showOnHome !== false);
    setActiveEditorTab('write');
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

  const handleRestoreDefaults = async () => {
    if (window.confirm("Do you want to restore and synchronize all Scottish Piping Q&As to Firestore? Any custom questions you added will be preserved.")) {
      setIsRestoring(true);
      try {
        await restoreDefaultFaqs();
      } finally {
        setIsRestoring(false);
      }
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs text-emerald-400 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-800/80 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Firestore Live Sync
          </span>
          <button
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            className="px-3.5 py-2 bg-tartan-navy hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/40 shadow hover:border-amber-400 flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Rebuild and synchronize full Scottish Piping Q&As to Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'Restoring...' : 'Rebuild / Restore FAQs'}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Missing Q&A Recovery Banner */}
      {faqs.length <= 1 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-200 font-serif">Scottish Piping Q&As Need Rebuilding ({faqs.length} question active)</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Only {faqs.length} question is currently saved in Firestore. Click &quot;Rebuild &amp; Sync All FAQs&quot; to restore the full set of 7 authentic Scottish bagpipe questions (Booking &amp; Payments, Travel, Tartan &amp; Attire, Tune Repertoire, Castle Logistics) to Cloud Firestore and sync across all devices.
              </p>
            </div>
          </div>
          <button
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-tartan-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 shrink-0 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'Rebuilding...' : 'Rebuild & Sync All FAQs'}</span>
          </button>
        </div>
      )}

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
                  <div className="text-xs text-gray-300 leading-relaxed pl-6 border-l-2 border-tartan-gold/40">
                    <FormattedFaqAnswer text={faq.answer} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Detailed Answer *
                  </label>
                  {/* Write vs Preview Tabs */}
                  <div className="flex items-center gap-1 bg-tartan-dark p-0.5 rounded-lg border border-tartan-border">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('write')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        activeEditorTab === 'write'
                          ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('preview')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                        activeEditorTab === 'preview'
                          ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {activeEditorTab === 'write' ? (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center flex-wrap gap-1.5 p-2 bg-tartan-dark rounded-xl border border-tartan-border/70 text-xs text-gray-300">
                      <button
                        type="button"
                        onClick={insertBullet}
                        className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 hover:text-white text-[11px] font-semibold border border-tartan-border flex items-center gap-1.5 transition-colors"
                        title="Add bullet point (•)"
                      >
                        <List className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>• Bullet</span>
                      </button>
                      <button
                        type="button"
                        onClick={insertNumbered}
                        className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 hover:text-white text-[11px] font-semibold border border-tartan-border flex items-center gap-1.5 transition-colors"
                        title="Add numbered item (1.)"
                      >
                        <ListOrdered className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>1. Numbered</span>
                      </button>
                      <button
                        type="button"
                        onClick={insertParagraph}
                        className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 hover:text-white text-[11px] font-semibold border border-tartan-border flex items-center gap-1.5 transition-colors"
                        title="Add paragraph break"
                      >
                        <Pilcrow className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>Paragraph</span>
                      </button>
                      <button
                        type="button"
                        onClick={insertBold}
                        className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 hover:text-white text-[11px] font-semibold border border-tartan-border flex items-center gap-1.5 transition-colors"
                        title="Bold text (**text**)"
                      >
                        <Bold className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>Bold</span>
                      </button>
                      <span className="text-[10px] text-gray-400 ml-auto hidden sm:inline">
                        Press Enter on bullet lines to continue list
                      </span>
                    </div>

                    <textarea
                      ref={answerTextareaRef}
                      rows={6}
                      required
                      value={formAnswer}
                      onChange={(e) => setFormAnswer(e.target.value)}
                      onKeyDown={handleAnswerKeyDown}
                      placeholder="Type or paste your answer here. Use the buttons above for bullets, numbered lists, and paragraphs..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent leading-relaxed font-mono"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-tartan-dark/60 border border-tartan-border rounded-xl p-4 min-h-[160px] max-h-[300px] overflow-y-auto">
                    {formAnswer.trim() ? (
                      <FormattedFaqAnswer text={formAnswer} className="text-xs text-gray-200" />
                    ) : (
                      <p className="text-xs text-gray-500 italic">No answer content entered yet. Switch back to Write to type your answer.</p>
                    )}
                  </div>
                )}
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
