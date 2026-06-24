import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { bannersAPI } from '../../lib/api';
import { Link } from 'react-router';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
  order: number;
  active: boolean;
}

const emptyForm = { title: '', subtitle: '', imageUrl: '', link: '', order: 0, active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyForm });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await bannersAPI.getAllAdmin();
      setBanners(data.banners || []);
    } catch (error: any) {
      console.error('Bannerlar yüklenemedi:', error);
      toast.error('Bannerlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setFormData({ ...emptyForm, order: banners.length });
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      link: b.link || '',
      order: b.order || 0,
      active: b.active !== false,
    });
    setShowModal(true);
  };

  const close = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ ...emptyForm });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error('Başlık ve görsel adresi (URL) gerekli');
      return;
    }
    try {
      const payload = { ...formData, order: Number(formData.order) || 0 };
      if (editing) {
        await bannersAPI.update(editing.id, payload);
        toast.success('Banner güncellendi');
      } else {
        await bannersAPI.create(payload);
        toast.success('Banner eklendi');
      }
      close();
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Kaydedilemedi');
    }
  };

  const remove = async (b: Banner) => {
    if (!confirm(`"${b.title}" bannerını silmek istiyor musunuz?`)) return;
    try {
      await bannersAPI.delete(b.id);
      toast.success('Banner silindi');
      setBanners((prev) => prev.filter((x) => x.id !== b.id));
    } catch {
      toast.error('Silinemedi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
              ← Admin Panel
            </Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <ImageIcon className="w-10 h-10 text-amber-600" />
              Ana Sayfa Bannerları
            </h1>
            <p className="text-slate-600 mt-2">Ana sayfada gösterilen tanıtım kuşaklarını yönetin</p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Banner</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Henüz banner eklenmemiş</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="h-32 bg-slate-100 relative">
                  {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />}
                  {!b.active && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-800 text-white text-xs rounded-full">Pasif</span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">Sıra: {b.order}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-slate-500 line-clamp-1">{b.subtitle}</p>}
                  <p className="text-xs text-amber-700 truncate mt-1">{b.link}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(b)} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200" title="Düzenle">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(b)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200" title="Sil">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{editing ? 'Banner Düzenle' : 'Yeni Banner'}</h2>
                <button onClick={close} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Başlık *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500" placeholder="örn. Bel Fıtığında Doğru Bilinen Yanlışlar" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alt Başlık</label>
                  <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500" placeholder="Kısa açıklama" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Görsel Adresi (URL) *</label>
                  <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500" placeholder="https://..." required />
                  {formData.imageUrl && <img src={formData.imageUrl} alt="önizleme" className="mt-2 h-24 w-full object-cover rounded-xl" />}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tıklanınca Gidilecek Adres</label>
                  <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500" placeholder="/blog/yazi-id veya https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sıra</label>
                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer py-3">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5 rounded" />
                      <span className="font-medium text-slate-700">Aktif (sitede göster)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={close} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">İptal</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg">{editing ? 'Güncelle' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
