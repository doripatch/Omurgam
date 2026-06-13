import { useState, useEffect } from 'react';
import { Phone, Mail, Trash2, Loader2, CalendarCheck, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsAPI } from '../../lib/api';
import { Link } from 'react-router';

interface Appt {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  preferredDate?: string;
  message?: string;
  status: 'new' | 'contacted' | 'done';
  createdAt: string;
}

const STATUS = {
  new: { label: 'Yeni', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  contacted: { label: 'Arandı', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
  done: { label: 'Tamamlandı', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

export default function AdminAppointments() {
  const [items, setItems] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsAPI.getAll();
      const sorted = (data.appointments || []).sort(
        (a: Appt, b: Appt) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(sorted);
    } catch (error: any) {
      console.error('Randevu talepleri yüklenemedi:', error);
      toast.error('Talepler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = async (a: Appt, status: Appt['status']) => {
    try {
      await appointmentsAPI.update(a.id, { status });
      setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, status } : x)));
    } catch {
      toast.error('Güncellenemedi');
    }
  };

  const remove = async (a: Appt) => {
    if (!confirm(`${a.name} adlı kişinin talebini silmek istiyor musunuz?`)) return;
    try {
      await appointmentsAPI.delete(a.id);
      toast.success('Talep silindi');
      setItems((prev) => prev.filter((x) => x.id !== a.id));
    } catch {
      toast.error('Silinemedi');
    }
  };

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleString('tr-TR');
    } catch {
      return d;
    }
  };

  const pending = items.filter((i) => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
            ← Admin Panel
          </Link>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <CalendarCheck className="w-10 h-10 text-amber-600" />
            Randevu Talepleri
          </h1>
          <p className="text-slate-600 mt-2">
            Toplam {items.length} talep{pending > 0 ? ` — ${pending} yeni` : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <CalendarCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Henüz talep yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((a) => (
              <div
                key={a.id}
                className={`bg-white border rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                  a.status === 'new' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{a.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS[a.status]?.cls || STATUS.new.cls}`}>
                        {STATUS[a.status]?.label || 'Yeni'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm flex-wrap">
                      <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-amber-700 hover:underline">
                        <Phone className="w-4 h-4" /> {a.phone}
                      </a>
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 text-amber-700 hover:underline">
                          <Mail className="w-4 h-4" /> {a.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{fmt(a.createdAt)}</span>
                </div>

                {a.subject && <p className="text-slate-800 font-semibold">{a.subject}</p>}
                {a.preferredDate && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" /> Tercih: {a.preferredDate}
                  </p>
                )}
                {a.message && <p className="text-slate-600 mt-2 whitespace-pre-line">{a.message}</p>}

                <div className="flex gap-2 mt-4 flex-wrap">
                  {a.status !== 'contacted' && (
                    <button onClick={() => setStatus(a, 'contacted')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors">
                      <Phone className="w-4 h-4" /> Arandı işaretle
                    </button>
                  )}
                  {a.status !== 'done' && (
                    <button onClick={() => setStatus(a, 'done')} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-200 transition-colors">
                      <Check className="w-4 h-4" /> Tamamlandı
                    </button>
                  )}
                  <button onClick={() => remove(a)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" /> Sil
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
