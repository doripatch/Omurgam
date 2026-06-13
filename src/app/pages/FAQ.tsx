import { HelpCircle, Plus, Minus, Search, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { faqAPI } from '../lib/api';
import { useSiteSettingsStore } from '../store/siteSettingsStore';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon?: string;
  createdAt?: string;
}

export default function FAQ() {
  const settings = useSiteSettingsStore((s) => s.settings);
  const t = settings.faq;

  const [items, setItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await faqAPI.getAll();
      setItems(data.items || []);
    } catch (error) {
      console.error('❌ SSS yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kategorileri içeriklerden türet
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return ['Tümü', ...Array.from(set)];
  }, [items]);

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((faq) => {
      const matchesSearch =
        !q ||
        faq.question?.toLowerCase().includes(q) ||
        faq.answer?.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'Tümü' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Arama */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Kategoriler */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Liste */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full p-6 text-left flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
                        {faq.icon || '❓'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {faq.category && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {faq.category}
                              </span>
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          {openId === faq.id ? (
                            <Minus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Plus className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {openId === faq.id && (
                    <div className="px-6 pb-6 pl-20">
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {items.length === 0 ? 'Henüz soru eklenmemiş.' : t.notFound}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                  {t.notFoundHint}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Yardım Bölümü */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">{t.helpTitle}</h2>
            <p className="mb-6 text-blue-100">
              {t.helpDesc}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/soru-sor"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                {t.helpCta1}
              </a>
              <a
                href="/iletisim"
                className="px-6 py-3 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-all"
              >
                {t.helpCta2}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
