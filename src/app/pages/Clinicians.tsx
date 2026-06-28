import { useState, useEffect } from 'react';
import { Stethoscope, Plus, Minus, Loader2, Clock } from 'lucide-react';
import { clinNotesAPI } from '../lib/api';
import Seo from '../components/Seo';

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  readingTime?: string;
  createdAt?: string;
}

export default function Clinicians() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    clinNotesAPI.getAll()
      .then((d) => setNotes(d.notes || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo
        title="Klinisyenler Buraya"
        description="Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik değerlendirmeler, genel tavsiyeler ve klinik notlar."
      />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            <span>Klinisyenler İçin</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
            Klinisyenler Buraya
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Prof. Dr. Defne Kaya Utlu'dan, meslektaşlarına yönelik değerlendirme, genel tavsiye ve klinik notlar.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-teal-600 animate-spin" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700 rounded-3xl p-12">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">Yakında klinisyenlere yönelik içerikler burada olacak.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => {
              const open = openId === n.id;
              return (
                <div key={n.id} className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-teal-200/30 dark:border-slate-700 rounded-3xl overflow-hidden">
                  <button onClick={() => setOpenId(open ? null : n.id)} className="w-full flex items-center justify-between gap-3 p-6 text-left">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {n.category && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
                            <Stethoscope className="w-3.5 h-3.5" /> {n.category}
                          </span>
                        )}
                        {n.readingTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[11px] font-medium">
                            <Clock className="w-3 h-3" /> {n.readingTime}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{n.title}</h3>
                    </div>
                    {open ? <Minus className="w-6 h-6 text-teal-600 flex-shrink-0" /> : <Plus className="w-6 h-6 text-slate-400 flex-shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line border-t border-slate-200 dark:border-slate-700 pt-4">
                        {n.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
