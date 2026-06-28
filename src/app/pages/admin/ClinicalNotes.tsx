import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Stethoscope, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { clinNotesAPI } from '../../lib/api';
import { Link } from 'react-router';

interface ClinNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  published: boolean;
  createdAt: string;
}

const emptyForm = { title: '', content: '', category: '', published: true };

export default function AdminClinicalNotes() {
  const [notes, setNotes] = useState<ClinNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClinNote | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyForm });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImporting(true);
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) throw new Error('Dosya bir liste (JSON array) değil');
      if (!confirm(`${arr.length} yazı içe aktarılacak. Devam edilsin mi?`)) {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      let ok = 0, fail = 0;
      for (const item of arr) {
        if (!item || !item.title || !item.content) { fail++; continue; }
        try {
          await clinNotesAPI.create({
            title: item.title,
            content: item.content,
            category: item.category || '',
            readingTime: item.readingTime || '',
            published: item.published !== false,
          });
          ok++;
        } catch {
          fail++;
        }
      }
      toast.success(`${ok} yazı eklendi${fail ? `, ${fail} başarısız` : ''} 🎉`);
      await load();
    } catch (err: any) {
      toast.error('İçe aktarma hatası: ' + (err.message || 'geçersiz dosya'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await clinNotesAPI.getAllAdmin();
      setNotes(data.notes || []);
    } catch (error: any) {
      console.error('Notlar yüklenemedi:', error);
      toast.error('Notlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => { setFormData({ ...emptyForm }); setEditing(null); setShowModal(true); };
  const openEdit = (n: ClinNote) => {
    setEditing(n);
    setFormData({ title: n.title || '', content: n.content || '', category: n.category || '', published: n.published !== false });
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditing(null); setFormData({ ...emptyForm }); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Başlık ve içerik gerekli');
      return;
    }
    try {
      if (editing) {
        await clinNotesAPI.update(editing.id, formData);
        toast.success('Not güncellendi');
      } else {
        await clinNotesAPI.create(formData);
        toast.success('Not eklendi');
      }
      close();
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Kaydedilemedi');
    }
  };

  const remove = async (n: ClinNote) => {
    if (!confirm(`"${n.title}" notunu silmek istiyor musunuz?`)) return;
    try {
      await clinNotesAPI.delete(n.id);
      toast.success('Not silindi');
      setNotes((prev) => prev.filter((x) => x.id !== n.id));
    } catch {
      toast.error('Silinemedi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">← Admin Panel</Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Stethoscope className="w-10 h-10 text-teal-600" />
              Klinisyenler Buraya
            </h1>
            <p className="text-slate-600 mt-2">Klinisyenlere yönelik yazılarınızı buradan ekleyin; /klinisyenler sayfasında yayınlanır</p>
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
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-60"
            >
              {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span>{importing ? 'İçe Aktarılıyor...' : 'Toplu İçe Aktar'}</span>
            </button>
            <button onClick={openAdd} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              <Plus className="w-5 h-5" /> <span>Yeni Not</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-12 h-12 text-teal-600 animate-spin" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Henüz not eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900">{n.title}</h3>
                      {n.category && <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">{n.category}</span>}
                      {n.published === false && <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold">Taslak</span>}
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">{n.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(n)} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200" title="Düzenle"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => remove(n)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200" title="Sil"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{editing ? 'Notu Düzenle' : 'Yeni Not'}</h2>
                <button onClick={close} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Başlık *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="örn. Bel ağrısında hastaya verilecek temel mesajlar" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">İçerik *</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="Klinisyenlere genel tavsiyeler..." required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kategori (opsiyonel)</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="örn. Bel, Boyun..." />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer py-3">
                      <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-5 h-5 rounded" />
                      <span className="font-medium text-slate-700">Yayında</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={close} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">İptal</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg">{editing ? 'Güncelle' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
