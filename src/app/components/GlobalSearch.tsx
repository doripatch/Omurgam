import { useState, useEffect } from 'react';
import { Search, X, FileText, Video, HelpCircle, Loader2, BookOpen, ScanLine, Compass } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { Link } from 'react-router';

interface SearchResult {
  id: string;
  type: IndexType;
  title: string;
  description: string;
  url: string;
  category?: string;
}

// Site içi arama dizini: build'de scripts/build-search-index.mjs üretir (gerçek içerik: sözlük, yazılar, videolar,
// MR terimleri, rehberler). Pencere ilk açıldığında bir kez indirilir ve bellekte tutulur.
type IndexType = 'page' | 'term' | 'mr' | 'blog' | 'video' | 'question';
interface IndexItem { t: IndexType; title: string; desc: string; url: string; cat?: string; k: string; h?: string }
let indexPromise: Promise<IndexItem[]> | null = null;
const loadIndex = () => {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : []))
      // Aranacak metin: başlık + açıklama + ek anahtar kelimeler (bir kez normalize edilir).
      .then((items: IndexItem[]) => items.map((it) => ({ ...it, h: `${normalize(`${it.title} ${it.desc}`)} ${it.k}` })))
      .catch(() => { indexPromise = null; return []; });
  }
  return indexPromise;
};
// build-search-index.mjs'teki norm() ile AYNI: Türkçe büyük/küçük harf ve şapka/nokta farkları yok sayılır.
const normalize = (s: string) => String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
  .normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const TYPE_WEIGHT: Record<IndexType, number> = { page: 8, term: 6, blog: 4, video: 3, mr: 2, question: 1 };

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  /** Açılışta kutuya yazılacak terim (ör. anasayfa arama kutusu). */
  initialQuery?: string;
}

export default function GlobalSearch({ isOpen, onClose, initialQuery = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    } else if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Arama hedefi: kullanıcı yazmayı bitirince (1,5 sn) tek etkinlik; harf harf değil.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) return;
    const t = setTimeout(() => trackEvent('search', { search_term: term.slice(0, 60).toLocaleLowerCase('tr-TR') }), 1500);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const index = await loadIndex();
      const tokens = normalize(searchQuery).split(' ').filter(Boolean);
      if (!tokens.length) { setResults([]); return; }
      const nq = tokens.join(' ');
      const scored: { r: SearchResult; score: number }[] = [];
      index.forEach((it, i) => {
        if (!tokens.every((tk) => (it.h as string).includes(tk))) return;
        const nt = normalize(it.title);
        const score = (nt === nq ? 100 : nt.startsWith(nq) ? 60 : nt.includes(nq) ? 40 : 10) + TYPE_WEIGHT[it.t];
        scored.push({ score, r: { id: String(i), type: it.t, title: it.title, description: it.desc, url: it.url, category: it.cat } });
      });
      scored.sort((x, y) => y.score - x.score);
      setResults(scored.slice(0, 20).map((x) => x.r));
    } catch (error) {
      console.error('Arama hatası:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-green-500" />;
      case 'term':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'mr':
        return <ScanLine className="w-5 h-5 text-teal-600" />;
      case 'page':
        return <Compass className="w-5 h-5 text-amber-600" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'video':
        return 'Video';
      case 'question':
        return 'Soru';
      case 'term':
        return 'Omurga Sözlüğü';
      case 'mr':
        return 'MR Terimi';
      case 'page':
        return 'Rehber';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Terim, yazı, video veya konu ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-lg"
          />
          {isSearching && (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aramak için en az 2 karakter girin</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sonuç bulunamadı</p>
              <p className="text-sm mt-2">Farklı bir arama terimi deneyin</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.url}
                  onClick={onClose}
                  className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-b-0"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.category && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {result.category}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {result.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {results.length > 0 && `${results.length} sonuç bulundu`}
            </span>
            <span>
              ESC ile kapat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
