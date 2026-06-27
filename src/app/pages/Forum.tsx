import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageSquare, Clock, User, Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, TABLES } from '../lib/supabase';
import Seo from '../components/Seo';

interface Question {
  id: string;
  question: string;
  excerpt: string;
  category: string;
  likes: number;
  created_at: string;
  users?: {
    name: string;
  };
  answers?: any[];
}

const categories = [
  'Tümü',
  'Bel Ağrısı',
  'Boyun Ağrısı',
  'Postür',
  'Egzersiz',
  'MR Sonuçları',
  'Genel'
];

export default function Forum() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchTerm, selectedCategory, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log('📥 Forum soruları yükleniyor...');

      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select(`
          *,
          users:user_id (name),
          answers (id)
        `)
        .eq('is_answered', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuestions = (data || []).map((q: any) => ({
        ...q,
        answers: q.answers || []
      }));

      console.log('✅ Forum soruları yüklendi:', formattedQuestions);
      setQuestions(formattedQuestions);
    } catch (error: any) {
      console.error('❌ Sorular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    // Category filter
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(search) ||
        q.excerpt.toLowerCase().includes(search) ||
        q.category.toLowerCase().includes(search)
      );
    }

    setFilteredQuestions(filtered);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 30) {
      return date.toLocaleDateString('tr-TR');
    } else if (diffInDays > 0) {
      return `${diffInDays} gün önce`;
    } else if (diffInHours > 0) {
      return `${diffInHours} saat önce`;
    } else {
      return 'Az önce';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo title="Sizden Gelenler" description="Omurga sağlığı hakkında sorularınızı sorun, Prof. Dr. Defne Kaya Utlu ve ekibinden yanıtlar alın." />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold rounded-full mb-6 text-sm uppercase tracking-wide">
              Topluluk
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
              Sizden Gelenler
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Sorularınızı sorun, Prof. Dr. Defne Kaya Utlu ve ekibi yanıtlasın. Sormadan önce aşağıdaki yanıtlanmış soruları inceleyin — cevabınız zaten burada olabilir.
            </p>

            <div>
                <Link
                  to="/soru-sor"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-xl hover:shadow-2xl group"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Soru Sor</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 shadow-xl"
          >
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Sorularda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-semibold text-slate-600">Kategori:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-500">
              <strong className="text-teal-600">{filteredQuestions.length}</strong> soru bulundu
            </div>
          </motion.div>
        </div>
      </section>

      {/* Questions Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
              <p className="text-xl text-slate-600">Sorular yükleniyor...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 backdrop-blur-xl bg-white/80 border border-slate-200/30 rounded-3xl p-12"
            >
              <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Soru bulunamadı</h3>
              <p className="text-slate-600 mb-8">
                {searchTerm || selectedCategory !== 'Tümü' 
                  ? 'Arama kriterlerinize uygun soru bulunamadı. Filtreleri değiştirmeyi deneyin.'
                  : 'Henüz yanıtlanmış soru bulunmuyor.'}
              </p>
              <Link
                to="/soru-sor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                İlk Soruyu Siz Sorun
              </Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link
                    to={`/soru/${question.id}`}
                    className="block h-full backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                  >
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                        {question.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(question.created_at)}
                      </span>
                    </div>

                    {/* Question */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {question.question}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {question.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="w-4 h-4" />
                        <span>{question.users?.name || 'Anonim'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold">
                        <MessageSquare className="w-4 h-4" />
                        <span>{question.answers?.length || 0} Cevap</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-xl bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-12 text-center shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Sorunuz mu var?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Omurga sağlığı hakkında merak ettiklerinizi sorun, uzman yanıtları alın
            </p>
            <Link
              to="/soru-sor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl group"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Hemen Soru Sor</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}