import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, Brain, AlertTriangle, CheckCircle, Info, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { termsAPI } from '../lib/api';
import { toast } from 'sonner';
import FavoriteButton from '../components/FavoriteButton';
import Seo from '../components/Seo';

const MR_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://omurgam.com/mr-analiz#webpage',
      url: 'https://omurgam.com/mr-analiz',
      name: 'MR Raporu Terim Sözlüğü — Bel ve Boyun MR Raporu Nasıl Okunur?',
      description:
        'MR raporunuzda geçen protrüzyon, ekstrüzyon, bulging, dejenerasyon gibi terimlerin ne anlama geldiğini sade bir dille öğrenin.',
      inLanguage: 'tr-TR',
      publisher: { '@id': 'https://omurgam.com/#org' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'MR raporunda protrüzyon ne demek?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Protrüzyon, diskin dış halkası (anulus fibrosus) tamamen yırtılmadan, iç kısmının dışarı doğru çıkıntı yapmasıdır. Fıtıklaşmanın erken evresi olarak kabul edilir ve tek başına ameliyat gerektiği anlamına gelmez.',
          },
        },
        {
          '@type': 'Question',
          name: 'MR raporunda ekstrüzyon ne demek?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ekstrüzyon, diskin dış halkasının yırtılıp iç materyalin dışarı taşmasıdır. Protrüzyona göre daha ileri bir fıtık tipidir; ancak tedavi kararı görüntüleme değil, kişinin şikâyetleri ve muayenesiyle verilir.',
          },
        },
        {
          '@type': 'Question',
          name: 'MR raporunda fıtık görülmesi ameliyat gerektiği anlamına mı gelir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hayır. Hiçbir şikâyeti olmayan kişilerde de MR’da disk taşması bulunabilir. Fıtık bulgusu tek başına ameliyat kararı vermez; her zaman klinik muayene ile birlikte yorumlanır.',
          },
        },
      ],
    },
  ],
};

interface MRTerm {
  id: string;
  term: string;
  explanation: string;
  risk_level: string; // 'low' | 'medium' | 'high' veya '' (risksiz/nötr terim)
  category: string;
  recommendations: string[];
}

const hasRisk = (level?: string) => level === 'low' || level === 'medium' || level === 'high';

// Türkçe karakter duyarlı slug (sitemap ile birebir aynı mantık)
const TR_MAP: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
};
const slugify = (s: string) =>
  s.split('').map((c) => TR_MAP[c] ?? c).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

export default function MRAnalyzer() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeSlug = decodeURIComponent(location.pathname.replace(/^\/mr-analiz\/?/, '')).trim();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MRTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<MRTerm | null>(null);
  const [allTerms, setAllTerms] = useState<MRTerm[]>([]);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  // URL'de bir terim slug'ı varsa o terimi seç (derin bağlantı / SEO)
  useEffect(() => {
    if (!routeSlug || allTerms.length === 0) return;
    const found = allTerms.find((t) => slugify(t.term) === routeSlug);
    if (found) {
      setSelectedTerm(found);
      setSearchResults([found]);
    }
  }, [routeSlug, allTerms]);

  // Bir terim seçince URL'i o terimin kalıcı adresine güncelle
  const selectTerm = (term: MRTerm) => {
    setSelectedTerm(term);
    const sl = slugify(term.term);
    if (sl && `/mr-analiz/${sl}` !== location.pathname) {
      navigate(`/mr-analiz/${sl}`);
    }
  };

  const termDescription = selectedTerm
    ? `${selectedTerm.term}: ${selectedTerm.explanation.replace(/\s+/g, ' ').slice(0, 155)}`
    : 'MR raporunuzda geçen protrüzyon, ekstrüzyon, bulging, dejenerasyon gibi terimlerin ne anlama geldiğini sade ve bilimsel bir dille öğrenin. 290+ MR terimi, Prof. Dr. Defne Kaya Utlu editörlüğünde.';
  const termTitle = selectedTerm
    ? `${selectedTerm.term} Nedir? — MR Raporu Terimi`
    : 'MR Raporu Terim Sözlüğü — Bel ve Boyun MR Raporu Nasıl Okunur?';
  const seoJsonLd = selectedTerm
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'MedicalWebPage',
            url: `https://omurgam.com/mr-analiz/${slugify(selectedTerm.term)}`,
            name: termTitle,
            description: termDescription,
            inLanguage: 'tr-TR',
            publisher: { '@id': 'https://omurgam.com/#org' },
          },
          {
            '@type': 'DefinedTerm',
            name: selectedTerm.term,
            description: selectedTerm.explanation,
            inDefinedTermSet: {
              '@type': 'DefinedTermSet',
              name: 'Omurgam MR Raporu Terim Sözlüğü',
              url: 'https://omurgam.com/mr-analiz',
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://omurgam.com' },
              { '@type': 'ListItem', position: 2, name: 'MR Terim Sözlüğü', item: 'https://omurgam.com/mr-analiz' },
              { '@type': 'ListItem', position: 3, name: selectedTerm.term, item: `https://omurgam.com/mr-analiz/${slugify(selectedTerm.term)}` },
            ],
          },
        ],
      }
    : MR_JSONLD;

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const data = await termsAPI.getAll();
      setAllTerms(data.terms || []);
      
      // Set popular terms (first 6 terms)
      const popular = (data.terms || []).slice(0, 6).map((t: MRTerm) => t.term);
      setPopularTerms(popular);
    } catch (error) {
      console.error('❌ Terimler yüklenirken hata:', error);
      toast.error('Terimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Lütfen bir terim girin');
      return;
    }

    try {
      const data = await termsAPI.search(searchQuery);
      setSearchResults(data.terms || []);
      
      if (data.terms && data.terms.length > 0) {
        selectTerm(data.terms[0]);
      } else {
        setSelectedTerm(null);
        toast.info('Aradığınız terim bulunamadı');
      }
    } catch (error) {
      console.error('❌ Arama hatası:', error);
      toast.error('Arama sırasında hata oluştu');
    }
  };

  const handlePopularTermClick = (termName: string) => {
    setSearchQuery(termName);
    const result = allTerms.find(t => t.term === termName);
    if (result) {
      selectTerm(result);
      setSearchResults([result]);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'from-emerald-500 to-green-500';
      case 'medium':
        return 'from-amber-500 to-orange-500';
      case 'high':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-amber-600 to-orange-600'; // nötr terim (marka rengi)
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-8 h-8 text-white" />;
      case 'medium':
        return <AlertCircle className="w-8 h-8 text-white" />;
      case 'high':
        return <AlertTriangle className="w-8 h-8 text-white" />;
      default:
        return <Info className="w-8 h-8 text-white" />; // nötr terim
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low':
        return 'Düşük Risk';
      case 'medium':
        return 'Orta Risk';
      case 'high':
        return 'Yüksek Risk';
      default:
        return '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      <Seo title={termTitle} description={termDescription} jsonLd={seoJsonLd} />
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900 text-white py-12 md:py-20 px-4 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4 md:mb-6">
            <Search className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold">TIBBİ TERİM SÖZLÜĞÜ</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {selectedTerm ? `${selectedTerm.term} Nedir?` : 'MR Raporu Terim Sözlüğü'}
          </h1>
          <p className="text-base md:text-xl text-amber-100 mb-4 px-2 whitespace-pre-line">
            {selectedTerm
              ? selectedTerm.explanation
              : 'MR raporunuzda geçen tıbbi terimleri arayın ve ne anlama geldiklerini öğrenin'}
          </p>
          
          {/* Disclaimer */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-8 p-3 md:p-4 bg-amber-500/20 border border-amber-400/30 rounded-2xl">
            <p className="text-xs md:text-sm text-amber-100">
              <strong className="text-white">ÖNEMLİ:</strong> Bu sözlük yalnızca bilgilendirme amaçlıdır. 
              MR raporunuzun tıbbi analizi için mutlaka hekiminize danışın.
            </p>
          </div>

          {/* Main Search */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-xl"></div>
              <div className="relative backdrop-blur-xl bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-1.5 md:p-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 px-3 sm:px-0">
                    <div className="sm:pl-4">
                      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                    </div>
                    <input
                      type="text"
                      placeholder='Disk protrüzyonu...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 bg-transparent py-3 sm:py-4 px-1 sm:px-2 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                  >
                    Ara
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Terms */}
          <div className="mt-6 md:mt-8">
            <p className="text-teal-200 text-xs md:text-sm mb-3">Popüler Aramalar:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularTermClick(term)}
                  className="px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs md:text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {selectedTerm ? (
          <div className="space-y-4 md:space-y-6">
            {/* Risk Level Card */}
            <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br ${getRiskColor(selectedTerm.risk_level)} p-1`}>
              <div className="backdrop-blur-xl bg-white/95 rounded-[1rem] md:rounded-[1.4rem] p-4 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${getRiskColor(selectedTerm.risk_level)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    {getRiskIcon(selectedTerm.risk_level)}
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 md:mb-4 gap-3">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                          {selectedTerm.term}
                        </h2>
                        <span className="inline-block px-3 md:px-4 py-1 bg-slate-100 text-slate-700 text-xs md:text-sm font-semibold rounded-full">
                          {selectedTerm.category}
                        </span>
                      </div>
                      {hasRisk(selectedTerm.risk_level) && (
                        <div className="text-left sm:text-right">
                          <div className="text-xs md:text-sm text-slate-500 mb-1">Risk Seviyesi</div>
                          <div className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${getRiskColor(selectedTerm.risk_level)} bg-clip-text text-transparent`}>
                            {getRiskText(selectedTerm.risk_level)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <FavoriteButton type="term" itemId={selectedTerm.id} title={selectedTerm.term} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Card — sadece öneri varsa göster */}
            {selectedTerm.recommendations && selectedTerm.recommendations.length > 0 && (
              <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-2xl md:rounded-3xl p-4 md:p-8">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-slate-900">Öneriler ve Tedavi Yaklaşımı</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {selectedTerm.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 md:p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl md:rounded-2xl"
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-slate-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Card */}
            <div className="backdrop-blur-xl bg-amber-50/80 border border-amber-200 rounded-2xl md:rounded-3xl p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Info className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-2 text-sm md:text-base">Önemli Uyarı</h4>
                  <p className="text-amber-800 text-xs md:text-base">
                    Bu bilgiler yalnızca bilgilendirme amaçlıdır ve kesin tanı yerine geçmez. 
                    MR raporunuzun detaylı değerlendirmesi için mutlaka bir omurga uzmanına danışın. 
                    Her hastanın durumu farklıdır ve bireysel tedavi planı gerektirir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              {searchResults.length} sonuç bulundu
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {searchResults.map((term) => (
                <button
                  key={term.term}
                  onClick={() => selectTerm(term)}
                  className="text-left backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 flex-1">{term.term}</h3>
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getRiskColor(term.risk_level)} rounded-xl flex items-center justify-center ml-2`}>
                      {getRiskIcon(term.risk_level)}
                    </div>
                  </div>
                  <p className="text-slate-600 mb-3 line-clamp-2 text-sm md:text-base">{term.explanation}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-slate-500">{term.category}</span>
                    {hasRisk(term.risk_level) && (
                      <span className={`text-xs md:text-sm font-semibold bg-gradient-to-r ${getRiskColor(term.risk_level)} bg-clip-text text-transparent`}>
                        {getRiskText(term.risk_level)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sonuç bulunamadı</h3>
            <p className="text-slate-600 mb-6">
              Aradığınız terim veritabanımızda bulunamadı. Farklı bir terim deneyin.
            </p>
            <p className="text-sm text-slate-500">
              Veya doğrudan <a href="/soru-sor" className="text-teal-600 hover:underline">soru sorabilirsiniz</a>
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Info Cards */}
            <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Düşük Risk</h3>
              <p className="text-slate-600 text-sm">
                Genellikle konservatif tedavi yöntemleri ile tedavi edilebilir
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Orta Risk</h3>
              <p className="text-slate-600 text-sm">
                Düzenli takip ve tedavi gerektirebilir, doktor kontrolü önemlidir
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Yüksek Risk</h3>
              <p className="text-slate-600 text-sm">
                Acil uzman değerlendirmesi gerektirebilir, ciddi takip şarttır
              </p>
            </div>

            {/* Database Stats */}
            <div className="md:col-span-3 backdrop-blur-xl bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-8 text-white text-center">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                Sözlüğümüzde {allTerms.length}+ Tıbbi Terim
              </h3>
              <p className="text-teal-100">
                Sürekli güncellenen veri tabanımız ile MR raporu terimlerini anlayın
              </p>
            </div>

            {/* Tüm terimler dizini — her terimin kalıcı adresi (SEO / crawler keşfi) */}
            {allTerms.length > 0 && (
              <div className="md:col-span-3 backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Tüm Terimler (A–Z)</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {[...allTerms]
                    .sort((a, b) => a.term.localeCompare(b.term, 'tr'))
                    .map((t) => (
                      <a
                        key={t.id || t.term}
                        href={`/mr-analiz/${slugify(t.term)}`}
                        onClick={(e) => { e.preventDefault(); selectTerm(t); }}
                        className="text-sm text-teal-700 hover:underline"
                      >
                        {t.term}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}