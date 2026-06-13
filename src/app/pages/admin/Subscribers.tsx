import { useState, useEffect } from 'react';
import { Mail, Trash2, Loader2, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { newsletterAPI } from '../../lib/api';
import { Link } from 'react-router';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await newsletterAPI.getAll();
      const sorted = (data.subscribers || []).sort(
        (a: Subscriber, b: Subscriber) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSubs(sorted);
    } catch (error: any) {
      console.error('Aboneler yüklenemedi:', error);
      toast.error('Aboneler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (s: Subscriber) => {
    if (!confirm(`${s.email} aboneliğini silmek istiyor musunuz?`)) return;
    try {
      await newsletterAPI.delete(s.id);
      toast.success('Abone silindi');
      setSubs((prev) => prev.filter((x) => x.id !== s.id));
    } catch {
      toast.error('Silinemedi');
    }
  };

  // Tüm e-postaları CSV olarak indir (Mailchimp vb.'ye aktarmak için)
  const exportCsv = () => {
    if (subs.length === 0) return;
    const rows = ['email,tarih', ...subs.map((s) => `${s.email},${s.createdAt}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omurgam-aboneler.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('tr-TR');
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
              ← Admin Panel
            </Link>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Users className="w-10 h-10 text-amber-600" />
              Bülten Aboneleri
            </h1>
            <p className="text-slate-600 mt-2">Toplam {subs.length} abone</p>
          </div>
          {subs.length > 0 && (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              CSV İndir
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Henüz abone yok</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            {subs.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-4 px-6 py-4 ${
                  i !== subs.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-slate-800 truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-slate-400">{fmt(s.createdAt)}</span>
                  <button
                    onClick={() => remove(s)}
                    className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
