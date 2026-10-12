// "Bana rastgele bir şey öğret" düğmesi (anasayfa). Pencere ve içerik havuzu yalnız basılınca yüklenir:
// sayfa açılışına yük getirmez (hız puanı korunur). SSR güvenli: render sırasında tarayıcı API'si yok.
import { lazy, Suspense, useState } from 'react';
import { Dices } from 'lucide-react';

const LearnModal = lazy(() => import('./LearnModal'));

export default function LearnButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-700 to-amber-700 text-white font-black shadow-lg shadow-orange-600/20 hover:scale-[1.03] active:scale-100 transition-transform"
      >
        <Dices className="w-5 h-5" aria-hidden="true" /> Bana rastgele bir şey öğret
      </button>
      {open && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />}>
          <LearnModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
