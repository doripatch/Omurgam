import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Search, BookOpen, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { medicalTermsAPI } from '../../lib/api';
import { Link } from 'react-router';

interface MedicalTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  opening?: string;
  clinicalNote?: string;
  mistakeWrong?: string;
  mistakeRight?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  'Tedavi Yöntemleri',
  'Ortopedi & Cerrahi',
  'İlaç & Malzeme',
  'Tanı & Görüntüleme',
  'Genel Tıbbi Terimler',
  'Diğer',
];

const emptyForm = {
  term: '',
  definition: '',
  category: CATEGORIES[0],
  aliases: '',
  opening: '',
  clinicalNote: '',
  mistakeWrong: '',
  mistakeRight: '',
};

export default function AdminMedicalTerms() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<MedicalTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<MedicalTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ ...emptyForm });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const buildPayload = () => ({
    term: formData.term.trim(),
    definition: formData.definition.trim(),
    category: formData.category,
    aliases: formData.aliases.trim(),
    opening: formData.opening.trim(),
    clinicalNote: formData.clinicalNote.trim(),
    mistakeWrong: formData.mistakeWrong.trim(),
    mistakeRight: formData.mistakeRight.trim(),
  });

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImporting(true);
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) throw new Error('Dosya bir liste (JSON array) değil');
      if (!confirm(`${arr.length} terim içe aktarılacak. Devam edilsin mi?`)) {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      let ok = 0;
      let fail = 0;
      for (const item of arr) {
        if (!item || !item.term) { fail++; continue; }
        try {
          await medicalTermsAPI.create({
            term: item.term,
            definition: item.definition || '',
            category: item.category || 'Diğer',
            aliases: item.aliases || '',
            opening: item.opening || '',
            clinicalNote: item.clinicalNote || '',
            mistakeWrong: item.mistakeWrong || '',
            mistakeRight: item.mistakeRight || '',
          });
          ok++;
        } catch {
          fail++;
        }
      }
      toast.success(`${ok} terim eklendi${fail ? `, ${fail} başarısız` : ''}`);
      await loadTerms();
    } catch (err: any) {
      toast.error('İçe aktarma hatası: ' + (err.message || 'geçersiz dosya'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredTerms(terms);
    } else {
      setFilteredTerms(
        terms.filter(
          (t) =>
            t.term.toLowerCase().includes(q) ||
            t.definition.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, terms]);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const data = await medicalTermsAPI.getAll();
      const sorted = (data.terms || []).sort((a: MedicalTerm, b: MedicalTerm) =>
        a.term.localeCompare(b.term, 'tr')
      );
      setTerms(sorted);
      setFilteredTerms(sorted);
    } catch (error: any) {
      console.error('❌ Terimler yüklenirken hata:', error);
      toast.error('Terimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => setFormData({ ...emptyForm });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.term.trim() || !formData.definition.trim()) {
      toast.error('Terim ve açıklama gerekli');
      return;
    }
    try {
      await medicalTermsAPI.create(buildPayload());
      toast.success('Terim başarıyla eklendi!');
      setShowAddModal(false);
      resetForm();
      await loadTerms();
    } catch (error: any) {
      console.error('❌ Terim eklenirken hata:', error);
      toast.error(error.message || 'Terim eklenirken hata oluştu');
    }
  };

  const handleEdit = (term: MedicalTerm) => {
    setEditingTerm(term);
    setFormData({
      term: term.term,
      definition: term.definition,
      category: term.category || CATEGORIES[0],
      aliases: (term as any).aliases || '',
      opening: term.opening || '',
      clinicalNote: term.clinicalNote || '',
      mistakeWrong: term.mistakeWrong || '',
      mistakeRight: term.mistakeRight || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm) return;
    if (!formData.term.trim() || !formData.definition.trim()) {
      toast.error('Terim ve açıklama gerekli');
      return;
    }
    try {
      await medicalTermsAPI.update(editingTerm.id, buildPayload());
      toast.success('Terim başarıyla güncellendi!');
      setShowEditModal(false);
      setEditingTerm(null);
      resetForm();
      await loadTerms();
    } catch (error: any) {
      console.error('❌ Terim güncellenirken hata:', error);
      toast.error(error.message || 'Terim güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string, termName: string) => {
    if (!confirm(`"${termName}" terimini silmek istediğinizden emin misiniz?`)) return;
    try {
      await medicalTermsAPI.delete(id);
      toast.success('Terim silindi');
      await loadTerms();
    } catch (error: any) {
      console.error('❌ Terim silinirken hata:', error);
      toast.error(error.message || 'Terim silinirken hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              to="/admin"
              className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block"
            >
              ← Admin Panel
            </Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-amber-600" />
              Sağlık Sözlüğü
            </h1>
            <p className="text-slate-600 mt-2">Genel tıbbi ve tedavi terimlerini yönetin</p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-5 py-3 bg-white border-2 border-amber-200 text-amber-700 rounded-2xl font-bold hover:bg-amber-50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span>{importing ? 'İçe Aktarılıyor...' : 'Toplu İçe Aktar'}</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Terim Ekle</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Terim ara..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz terim eklenmemiş'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-slate-900">{term.term}</h3>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {term.definition}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(term)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(term.id, term.term)}
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

        {/* Add / Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {showEditModal ? 'Terimi Düzenle' : 'Yeni Terim Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingTerm(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={showEditModal ? handleUpdate : handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Terim *</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Örn: Çimentolu Alçı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama *</label>
                  <textarea
                    value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={5}
                    placeholder="Terimin sade ve anlaşılır açıklaması..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Halk Dilinde / Eş Anlamlılar</label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Virgülle ayırın: bel fıtığı, fıtık..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Kullanıcılar bu kelimelerle de arayabilir.</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mt-3 mb-1">Aşağıdaki alanlar opsiyoneldir — doldurursanız sözlükte zengin görünüm oluşturur.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Açılış</label>
                  <textarea
                    value={formData.opening}
                    onChange={(e) => setFormData({ ...formData, opening: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Dikkat çeken giriş cümlesi..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Klinik Pratikten Bir Not</label>
                  <textarea
                    value={formData.clinicalNote}
                    onChange={(e) => setFormData({ ...formData, clinicalNote: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Klinik gözleminizi yansıtan kısa not..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sık Yapılan Yanlış (❌)</label>
                  <input
                    type="text"
                    value={formData.mistakeWrong}
                    onChange={(e) => setFormData({ ...formData, mistakeWrong: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Yaygın yanlış inanış..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Doğrusu (✅)</label>
                  <input
                    type="text"
                    value={formData.mistakeRight}
                    onChange={(e) => setFormData({ ...formData, mistakeRight: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Doğru bilgi..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingTerm(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {showEditModal ? 'Güncelle' : 'Kaydet'}
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
