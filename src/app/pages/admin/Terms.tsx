import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Search, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { termsAPI } from '../../lib/api';
import { Link } from 'react-router';

interface Term {
  id: string;
  term: string;
  explanation: string;
  risk_level: 'low' | 'medium' | 'high';
  category: string;
  recommendations: string[];
  created_at?: string;
}

const RISK_LEVEL_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_LEVEL_LABELS = {
  low: 'Düşük Risk',
  medium: 'Orta Risk',
  high: 'Yüksek Risk',
};

const CATEGORIES = [
  'Disk Sorunları',
  'Dejeneratif Hastalıklar',
  'Yapısal Sorunlar',
  'Sinir Sıkışması',
  'Diğer',
];

export default function AdminTerms() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    term: '',
    explanation: '',
    risk_level: 'low' as 'low' | 'medium' | 'high',
    category: CATEGORIES[0],
    recommendations: [''],
  });

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTerms(terms);
    } else {
      const filtered = terms.filter(
        (term) =>
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
    }
  }, [searchQuery, terms]);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Terimler yükleniyor...');
      const data = await termsAPI.getAll();
      console.log('📚 Yüklenen terimler:', data);
      setTerms(data.terms || []);
      setFilteredTerms(data.terms || []);
    } catch (error: any) {
      console.error('❌ Terimler yüklenirken hata:', error);
      toast.error('Terimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.term || !formData.explanation) {
      toast.error('Terim ve açıklama gerekli');
      return;
    }

    const validRecommendations = formData.recommendations.filter((r) => r.trim() !== '');
    if (validRecommendations.length === 0) {
      toast.error('En az bir öneri eklemelisiniz');
      return;
    }

    try {
      console.log('📝 Terim ekleniyor:', formData);
      await termsAPI.create({
        term: formData.term,
        explanation: formData.explanation,
        risk_level: formData.risk_level,
        category: formData.category,
        recommendations: validRecommendations,
      });
      console.log('✅ Terim eklendi!');
      toast.success('Terim başarıyla eklendi!');
      setShowAddModal(false);
      resetForm();
      await loadTerms();
    } catch (error: any) {
      console.error('❌ Terim eklenirken hata:', error);
      toast.error(error.message || 'Terim eklenirken hata oluştu');
    }
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormData({
      term: term.term,
      explanation: term.explanation,
      risk_level: term.risk_level,
      category: term.category,
      recommendations: (term.recommendations && term.recommendations.length > 0) ? term.recommendations : [''],
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTerm) return;

    const validRecommendations = formData.recommendations.filter((r) => r.trim() !== '');
    if (validRecommendations.length === 0) {
      toast.error('En az bir öneri eklemelisiniz');
      return;
    }

    try {
      console.log('📝 Terim güncelleniyor:', editingTerm.id, formData);
      await termsAPI.update(editingTerm.id, {
        term: formData.term,
        explanation: formData.explanation,
        risk_level: formData.risk_level,
        category: formData.category,
        recommendations: validRecommendations,
      });
      console.log('✅ Terim güncellendi!');
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
      console.log('🗑️ Terim siliniyor:', id);
      await termsAPI.delete(id);
      console.log('✅ Terim silindi!');
      toast.success('Terim silindi');
      await loadTerms();
    } catch (error: any) {
      console.error('❌ Terim silinirken hata:', error);
      toast.error(error.message || 'Terim silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      term: '',
      explanation: '',
      risk_level: 'low',
      category: CATEGORIES[0],
      recommendations: [''],
    });
  };

  const addRecommendation = () => {
    setFormData({
      ...formData,
      recommendations: [...formData.recommendations, ''],
    });
  };

  const removeRecommendation = (index: number) => {
    const newRecommendations = formData.recommendations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      recommendations: newRecommendations.length > 0 ? newRecommendations : [''],
    });
  };

  const updateRecommendation = (index: number, value: string) => {
    const newRecommendations = [...formData.recommendations];
    newRecommendations[index] = value;
    setFormData({
      ...formData,
      recommendations: newRecommendations,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/admin"
              className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block"
            >
              ← Admin Panel
            </Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-600" />
              MR Terim Sözlüğü
            </h1>
            <p className="text-slate-600 mt-2">Tıbbi terimleri yönetin</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Terim Ekle</span>
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
              placeholder="Terim ara..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Terms List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900">{term.term}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          RISK_LEVEL_COLORS[term.risk_level]
                        }`}
                      >
                        {RISK_LEVEL_LABELS[term.risk_level]}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">{term.explanation}</p>
                    <div>
                      <p className="font-bold text-slate-900 mb-2">Öneriler:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {(term.recommendations || []).map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Yeni Terim Ekle</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Terim *
                  </label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Örn: Disk Hernisi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Terimin detaylı açıklaması..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Risk Seviyesi
                    </label>
                    <select
                      value={formData.risk_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          risk_level: e.target.value as 'low' | 'medium' | 'high',
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Düşük Risk</option>
                      <option value="medium">Orta Risk</option>
                      <option value="high">Yüksek Risk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Öneriler *
                  </label>
                  <div className="space-y-2">
                    {(formData.recommendations || ['']).map((rec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={rec}
                          onChange={(e) => updateRecommendation(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`Öneri ${index + 1}`}
                        />
                        {formData.recommendations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecommendation(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRecommendation}
                      className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors text-sm font-bold"
                    >
                      + Öneri Ekle
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingTerm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Terimi Düzenle</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTerm(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Terim *
                  </label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Risk Seviyesi
                    </label>
                    <select
                      value={formData.risk_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          risk_level: e.target.value as 'low' | 'medium' | 'high',
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Düşük Risk</option>
                      <option value="medium">Orta Risk</option>
                      <option value="high">Yüksek Risk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Öneriler *
                  </label>
                  <div className="space-y-2">
                    {(formData.recommendations || ['']).map((rec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={rec}
                          onChange={(e) => updateRecommendation(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`Öneri ${index + 1}`}
                        />
                        {formData.recommendations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecommendation(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRecommendation}
                      className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors text-sm font-bold"
                    >
                      + Öneri Ekle
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Güncelle
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