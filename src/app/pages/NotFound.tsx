import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-teal-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
        >
          <Home className="w-5 h-5" />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
