import { BadgeCheck, BookOpen } from 'lucide-react';

// E-E-A-T yazar/uzman kutusu — Google sağlık içeriğinde yazar otoritesine çok önem verir.
export default function AuthorBox({ updatedDate }: { updatedDate?: string }) {
  return (
    <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-6">
      <div className="flex items-start gap-4 bg-teal-50/60 dark:bg-slate-800/60 rounded-2xl p-5 border border-teal-200/40 dark:border-slate-700">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
          DK
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white">Prof. Dr. Defne Kaya Utlu</span>
            <BadgeCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Fizyoterapi Profesörü · Klinik Araştırmacı</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            39 bilimsel yayın · Google Scholar h-index 28 · 10+ kitap editörlüğü (Springer dâhil).
            Bu içerik güncel bilimsel kaynaklara dayalı olarak hazırlanmıştır ve genel bilgilendirme amaçlıdır;
            tıbbi değerlendirmenin yerine geçmez.
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Bilimsel kaynaklara dayalı
            </span>
            {updatedDate && <span>Son güncelleme: {updatedDate}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
