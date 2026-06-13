import { useState, useEffect } from 'react';
import { Mail, Trash2, Loader2, MailOpen, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { contactAPI } from '../../lib/api';
import { Link } from 'react-router';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await contactAPI.getAll();
      const sorted = (data.messages || []).sort(
        (a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(sorted);
    } catch (error: any) {
      console.error('Mesajlar yüklenemedi:', error);
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRead = async (m: Message) => {
    try {
      await contactAPI.markRead(m.id);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const remove = async (m: Message) => {
    if (!confirm(`"${m.name}" kişisinden gelen mesajı silmek istiyor musunuz?`)) return;
    try {
      await contactAPI.delete(m.id);
      toast.success('Mesaj silindi');
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
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

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
            ← Admin Panel
          </Link>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Inbox className="w-10 h-10 text-amber-600" />
            Gelen Mesajlar
          </h1>
          <p className="text-slate-600 mt-2">
            İletişim formundan gelen mesajlar{unread > 0 ? ` — ${unread} okunmamış` : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Henüz mesaj yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`bg-white border rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                  m.read ? 'border-slate-200' : 'border-amber-300 bg-amber-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
                      {!m.read && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                          Yeni
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${m.email}`} className="text-sm text-amber-700 hover:underline">
                      {m.email}
                    </a>
                  </div>
                  <span className="text-xs text-slate-400">{fmt(m.createdAt)}</span>
                </div>
                {m.subject && <p className="font-semibold text-slate-800 mb-1">{m.subject}</p>}
                <p className="text-slate-600 whitespace-pre-line">{m.message}</p>
                <div className="flex gap-2 mt-4">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('RE: ' + (m.subject || ''))}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Yanıtla
                  </a>
                  {!m.read && (
                    <button
                      onClick={() => toggleRead(m)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <MailOpen className="w-4 h-4" /> Okundu
                    </button>
                  )}
                  <button
                    onClick={() => remove(m)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
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
