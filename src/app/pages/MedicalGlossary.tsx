import { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Info, Tag, ChevronDown, Sparkles } from 'lucide-react';
import { medicalTermsAPI } from '../lib/api';
import { toast } from 'sonner';

interface MedicalTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// Public sayfada filtre olarak kullanılan kategoriler (admin ile aynı liste)
export const MEDICAL_CATEGORIES = [
  'Tedavi Yöntemleri',
  'Ortopedi & Cerrahi',
  'İlaç & Malzeme',
  'Tanı & Görüntüleme',
  'Genel Tıbbi Terimler',
  'Diğer',
];

export default function MedicalGlossary() {
  const [allTerms, setAllTerms] = useState<MedicalTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const data = await medicalTermsAPI.getAll();
      setAllTerms(data.terms || []);
    } catch (error) {
      console.error('❌ Sağlık sözlüğü yüklenirken hata:', error);
      toast.error('Terimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Arama + kategori filtresi
  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allTerms
      .filter((t) =>
        activeCategory === 'Tümü' ? true : t.category === activeCategory
      )
      .filter((t) =>
        !q
          ? true
          : t.term?.toLowerCase().includes(q) ||
            t.definition?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.term.localeCompare(b.term, 'tr'));
  }, [allTerms, searchQuery, activeCategory]);

  // A-Z grupla
  const groupedTerms = useMemo(() => {
    const groups: Record<string, MedicalTerm[]> = {};
    filteredTerms.forEach((t) => {
      const letter = (t.term?.[0] || '#').toLocaleUpperCase('tr');
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, 'tr'))
      .map((letter) => ({ letter, terms: groups[letter] }));
  }, [filteredTerms]);

  const categoryChips = ['Tümü', ...MEDICAL_CATEGORIES];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900 text-white py-12 md:py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4 md:mb-6">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold">SAĞLIK SÖZLÜĞÜ</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Tıbbi & Tedavi Terimleri
          </h1>
          <p className="text-base md:text-xl text-amber-100 mb-4 px-2">
            Çimentolu alçı, atel, traksiyon... Doktorunuzun kullandığı terimlerin
            ne anlama geldiğini sade bir dille öğrenin.
          </p>

          {/* Disclaimer */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-8 p-3 md:p-4 bg-amber-500/20 border border-amber-400/30 rounded-2xl">
            <p className="text-xs md:text-sm text-amber-100">
              <strong className="text-white">ÖNEMLİ:</strong> Bu sözlük yalnızca bilgilendirme
              amaçlıdır ve tıbbi tanı/tedavi yerine geçmez. Durumunuz için mutlaka hekiminize danışın.
            </p>
          </div>

          {/* Main Search */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-xl"></div>
              <div className="relative backdrop-blur-xl bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-1.5 md:p-2">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Örn: Çimentolu alçı, ödem, enflamasyon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent py-3 sm:py-4 px-1 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categoryChips.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Terimler yükleniyor...</p>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-amber-600" />
            </div>
            {allTerms.length === 0 ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Sözlük yakında dolacak
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Tıbbi ve tedavi terimleri buraya yakında eklenecek. Daha sonra tekrar göz atın.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sonuç bulunamadı</h3>
                <p className="text-slate-600 mb-4">
                  Aradığınız terim sözlüğümüzde henüz yok. Farklı bir kelime deneyin.
                </p>
                <a href="/soru-sor" className="text-amber-700 font-semibold hover:underline">
                  Veya doğrudan soru sorun →
                </a>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Sonuç sayısı */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{filteredTerms.length} terim listeleniyor</span>
            </div>

            {groupedTerms.map(({ letter, terms }) => (
              <div key={letter}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow">
                    {letter}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                </div>

                <div className="space-y-3">
                  {terms.map((term) => {
                    const isOpen = openId === term.id;
                    return (
                      <div
                        key={term.id}
                        className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-amber-200/40 dark:border-slate-700 rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : term.id)}
                          className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                {term.term}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                                <Tag className="w-3 h-3" />
                                {term.category}
                              </span>
                            </div>
                            {!isOpen && (
                              <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                                {term.definition}
                              </p>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-amber-600 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-4 md:px-5 pb-5 -mt-1">
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl">
                              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                                {term.definition}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alt bilgi kartı */}
        <div className="mt-12 backdrop-blur-xl bg-gradient-to-br from-amber-700 to-orange-700 rounded-3xl p-6 md:p-8 text-white text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h3 className="text-xl md:text-2xl font-bold mb-2">Aradığınız terim yok mu?</h3>
          <p className="text-amber-100 mb-4 max-w-xl mx-auto text-sm md:text-base">
            Merak ettiğiniz bir tıbbi terim varsa bize sorun, yanıtlayalım ve sözlüğe ekleyelim.
          </p>
          <a
            href="/soru-sor"
            className="inline-block px-6 py-3 bg-white text-amber-800 font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
          >
            Soru Sor
          </a>
        </div>
      </div>
    </div>
  );
}
