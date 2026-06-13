import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Search, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { faqAPI } from '../../lib/api';
import { Link } from 'react-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon?: string;
  createdAt?: string;
}

const SUGGESTED_CATEGORIES = [
  'Genel',
  'Tıbbi Bilgilendirme',
  'Forum',
  'İçerikler',
  'Hesap',
  'Terim Sözlüğü',
];

const emptyForm = {
  question: '',
  answer: '',
  category: 'Genel',
  icon: '❓',
};

export default function AdminFAQ() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [filtered, setFiltered] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFiltered(items);
    } else {
      setFiltered(
        items.filter(
          (i) =>
            i.question.toLowerCase().includes(q) ||
            i.answer.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, items]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await faqAPI.getAll();
      const sorted = (data.items || []).sort((a: FAQItem, b: FAQItem) =>
        (a.category || '').localeCompare(b.category || '', 'tr')
      );
      setItems(sorted);
      setFiltered(sorted);
    } catch (error: any) {
      console.error('❌ SSS yüklenirken hata:', error);
      toast.error('Sorular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => setFormData({ ...emptyForm });

  const openAdd = () => {
    resetForm();
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item: FAQItem) => {
    setEditing(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || 'Genel',
      icon: item.icon || '❓',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Soru ve cevap gerekli');
      return;
    }
    try {
      if (editing) {
        await faqAPI.update(editing.id, formData);
        toast.success('Soru güncellendi!');
      } else {
        await faqAPI.create(formData);
        toast.success('Soru eklendi!');
      }
      closeModal();
      await loadItems();
    } catch (error: any) {
      console.error('❌ SSS kaydederken hata:', error);
      toast.error(error.message || 'Kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`"${question}" sorusunu silmek istediğinizden emin misiniz?`)) return;
    try {
      await faqAPI.delete(id);
      toast.success('Soru silindi');
      await loadItems();
    } catch (error: any) {
      console.error('❌ SSS silinirken hata:', error);
      toast.error(error.message || 'Silinirken hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
              ← Admin Panel
            </Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <HelpCircle className="w-10 h-10 text-blue-600" />
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-slate-600 mt-2">SSS sayfasındaki soru-cevapları yönetin</p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Soru Ekle</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Soru ara..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz soru eklenmemiş'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-2xl">{item.icon || '❓'}</span>
                      <h3 className="text-xl font-bold text-slate-900">{item.question}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.question)}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editing ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Soru *</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: Platform üyeliği ücretli mi?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cevap *</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="Cevabı buraya yazın..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                    <input
                      type="text"
                      list="faq-categories"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Genel"
                    />
                    <datalist id="faq-categories">
                      {SUGGESTED_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">İkon (emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="❓"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {editing ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
