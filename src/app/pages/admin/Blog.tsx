import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { blogAPI } from '../../lib/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  section?: string;
  views: number;
  published: boolean;
  created_at: string;
}

const BLOG_SECTIONS = [
  { value: 'saglikli-yasam', label: 'Sağlıklı Yaşam' },
  { value: 'kaleminden', label: "Defne Hoca'nın Kaleminden" },
];

export default function AdminBlog() {
  // 📝 BLOG YÖNETİMİ SAYFASI - v2.0
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Bel Fıtığı',
    imageUrl: '',
    section: 'saglikli-yasam',
    published: false,
  });

  // Debug: Component mounted
  useEffect(() => {
    console.log('📝 AdminBlog component mounted!');
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Blog yazıları yükleniyor...');
      const data = await blogAPI.getAll();
      console.log('📚 Yüklenen blog yazıları:', data);
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error('❌ Load posts error:', error);
      toast.error('Blog yazıları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    try {
      await blogAPI.delete(id);
      toast.success('Yazı silindi');
      await loadPosts();
    } catch (error: any) {
      toast.error(error.message || 'Yazı silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) {
      toast.error('Lütfen en az bir yazı seçin');
      return;
    }

    if (!confirm(`${selectedPosts.length} yazıyı silmek istediğinize emin misiniz?`)) {
      return;
    }

    console.log('🗑️ TOPLU SİLME BAŞLADI - Silinecek ID\'ler:', selectedPosts);

    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const id of selectedPosts) {
        try {
          console.log(`🗑️ Siliniyor: ${id}`);
          const result = await blogAPI.delete(id);
          console.log(`✅ Silindi: ${id}`, result);
          successCount++;
        } catch (error: any) {
          console.error(`❌ Silinirken hata: ${id}`, error);
          errorCount++;
        }
      }
      
      console.log(`📊 SONUÇ: ${successCount} başarılı, ${errorCount} hata`);
      
      if (errorCount > 0) {
        toast.error(`${errorCount} yazı silinemedi, ${successCount} yazı silindi`);
      } else {
        toast.success(`${successCount} yazı başarıyla silindi! 🎉`);
      }
      
      setSelectedPosts([]);
      setIsDeleteMode(false);
      
      // Sayfayı yenile
      console.log('🔄 Yazılar yeniden yükleniyor...');
      await loadPosts();
      console.log('✅ Yazılar yenilendi');
    } catch (error: any) {
      console.error('❌ TOPLU SİLME HATASI:', error);
      toast.error(error.message || 'Yazılar silinirken hata oluştu');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await blogAPI.update(post.id, { published: !post.published });
      toast.success(post.published ? 'Yazı taslak yapıldı' : 'Yazı yayınlandı');
      await loadPosts();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Başlık ve içerik gerekli');
      return;
    }

    try {
      console.log('📝 Blog ekleme başladı:', formData);
      const result = await blogAPI.create({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        category: formData.category,
        imageUrl: formData.imageUrl,
        section: formData.section,
        published: formData.published,
      });
      console.log('✅ Blog eklendi:', result);
      toast.success('Blog yazısı başarıyla eklendi!');
      setShowAddModal(false);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Bel Fıtığı',
        imageUrl: '',
        section: 'saglikli-yasam',
        published: false,
      });
      await loadPosts();
    } catch (error: any) {
      console.error('❌ Blog ekleme hatası:', error);
      toast.error(error.message || 'Yazı eklenirken hata oluştu');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Başlık ve içerik gerekli');
      return;
    }

    if (!editingPost) return;

    try {
      console.log('📝 Blog düzenleme başladı:', formData);
      const result = await blogAPI.update(editingPost.id, {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        category: formData.category,
        imageUrl: formData.imageUrl,
        section: formData.section,
        published: formData.published,
      });
      console.log('✅ Blog güncellendi:', result);
      toast.success('Blog yazısı başarıyla güncellendi!');
      setShowEditModal(false);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Bel Fıtığı',
        imageUrl: '',
        section: 'saglikli-yasam',
        published: false,
      });
      await loadPosts();
    } catch (error: any) {
      console.error('❌ Blog düzenleme hatası:', error);
      toast.error(error.message || 'Yazı güncellenirken hata oluştu');
    }
  };

  const togglePostSelection = (id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(postId => postId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Blog Yönetimi</h1>
            <p className="text-slate-600">Blog yazılarını yönetin</p>
          </div>
          <div className="flex gap-3">
            {!isDeleteMode ? (
              <>
                <button
                  onClick={() => setIsDeleteMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                  Toplu Sil
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Yazı
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedPosts.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                  Seçilenleri Sil ({selectedPosts.length})
                </button>
                <button
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedPosts([]);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-300 transition-all"
                >
                  İptal
                </button>
              </>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <tr>
                  {isDeleteMode && (
                    <th className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === posts.length && posts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Başlık</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tarih</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Görüntülenme</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
                  {!isDeleteMode && (
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">İşlemler</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Yükleniyor...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Hiç yazı bulunamadı
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-purple-50/50 transition-colors">
                      {isDeleteMode && (
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => togglePostSelection(post.id)}
                            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{post.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(post.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Eye className="w-4 h-4" />
                          {post.views.toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="cursor-pointer"
                        >
                          {post.published ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                              Yayında
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                              Taslak
                            </span>
                          )}
                        </button>
                      </td>
                      {!isDeleteMode && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setFormData({
                                  title: post.title,
                                  content: post.content,
                                  excerpt: post.excerpt,
                                  category: post.category,
                                  imageUrl: post.imageUrl || '',
                                  section: post.section || 'saglikli-yasam',
                                  published: post.published,
                                });
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-teal-100 text-teal-600 rounded-xl transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Blog Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Yeni Blog Yazısı</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Başlık *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Örn: Bel Ağrısı İçin Egzersizler"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Kapak Görseli (URL)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://... (yazı kartında ve üstünde görünür)"
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="önizleme" className="mt-2 h-32 w-full object-cover rounded-2xl" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Özet (isteğe bağlı)</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                    placeholder="Kısa özet... (Boş bırakılırsa içerikten otomatik oluşturulur)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">İçerik *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[200px]"
                    placeholder="Blog içeriği..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Bölüm</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {BLOG_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Sağlıklı Yaşam genel yazılar; Defne Hoca'nın Kaleminden yalnızca omurga makaleleri için.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option>Bel Fıtığı</option>
                      <option>Boyun Ağrısı</option>
                      <option>Skolyoz</option>
                      <option>Postür</option>
                      <option>Egzersiz</option>
                      <option>Genel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Durum</label>
                    <select 
                      value={formData.published ? 'published' : 'draft'}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayınla</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                  >
                    Yazıyı Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Blog Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Blog Yazısını Düzenle</h2>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Başlık *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Örn: Bel Ağrısı İçin Egzersizler"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Kapak Görseli (URL)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://... (yazı kartında ve üstünde görünür)"
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="önizleme" className="mt-2 h-32 w-full object-cover rounded-2xl" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Özet (isteğe bağlı)</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                    placeholder="Kısa özet... (Boş bırakılırsa içerikten otomatik oluşturulur)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">İçerik *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[200px]"
                    placeholder="Blog içeriği..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Bölüm</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {BLOG_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Sağlıklı Yaşam genel yazılar; Defne Hoca'nın Kaleminden yalnızca omurga makaleleri için.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option>Bel Fıtığı</option>
                      <option>Boyun Ağrısı</option>
                      <option>Skolyoz</option>
                      <option>Postür</option>
                      <option>Egzersiz</option>
                      <option>Genel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Durum</label>
                    <select 
                      value={formData.published ? 'published' : 'draft'}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayınla</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                  >
                    Yazıyı Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    İptal
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