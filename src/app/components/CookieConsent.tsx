import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Cookie, Settings2 } from 'lucide-react';
import { trackPageview } from '../lib/analytics';
import {
  getConsent,
  setConsent,
  applyConsent,
  registerOpenPreferences,
  type ConsentState,
} from '../lib/consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [media, setMedia] = useState(true);

  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
      if (existing.analytics) trackPageview(window.location.pathname + window.location.search);
    } else {
      setShow(true);
    }
    // Footer "Çerez Tercihleri" linkinden yeniden açma
    registerOpenPreferences(() => {
      const cur = getConsent();
      setAnalytics(cur ? cur.analytics : true);
      setMedia(cur ? cur.media : true);
      setManage(true);
      setShow(true);
    });
  }, []);

  const persist = (c: ConsentState) => {
    setConsent(c);
    if (c.analytics) trackPageview(window.location.pathname + window.location.search);
    setShow(false);
    setManage(false);
  };

  const acceptAll = () => persist({ analytics: true, media: true });
  const rejectAll = () => persist({ analytics: false, media: false });
  const saveChoices = () => persist({ analytics, media });

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bu sitede; zorunlu çerezlerin yanı sıra, izninize bağlı olarak ziyaret istatistikleri (Google Analytics)
              ve gömülü içerikler (YouTube) için çerezler kullanıyoruz. Tercihinizi seçebilirsiniz. Detaylar için{' '}
              <Link to="/gizlilik" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline">
                Gizlilik &amp; Çerez Politikası
              </Link>
              .
            </p>
          </div>
          {!manage && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => setManage(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings2 className="w-4 h-4" /> Tercihleri Yönet
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                Kabul Et
              </button>
            </div>
          )}
        </div>

        {manage && (
          <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
            <CategoryRow
              title="Zorunlu çerezler"
              desc="Sitenin çalışması ve oturum/güvenlik için gereklidir. Kapatılamaz."
              checked
              disabled
            />
            <CategoryRow
              title="Analitik (Google Analytics 4)"
              desc="Ziyaret istatistiklerini anonim olarak ölçmemize yardımcı olur."
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              title="Gömülü medya (YouTube)"
              desc="Video sayfalarında gömülü YouTube oynatıcısını etkinleştirir."
              checked={media}
              onChange={setMedia}
            />
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              <button
                onClick={rejectAll}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Tümünü Reddet
              </button>
              <button
                onClick={saveChoices}
                className="px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                Seçimi Kaydet
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        aria-pressed={checked}
        className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors ${
          checked ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
