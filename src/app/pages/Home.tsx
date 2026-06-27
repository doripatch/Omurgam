import { Link } from 'react-router';
import { ArrowRight, Play, Search, Heart, Sparkles, Check, Star, MessageCircle, ThumbsUp, Clock, HelpCircle, Plus, Minus, BookOpen, XCircle, CheckCircle2, Instagram, Youtube, Linkedin, Facebook, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import { faqAPI, medicalTermsAPI, bannersAPI } from '../lib/api';
import Seo from '../components/Seo';

interface Question {
  id: string;
  question: string;
  excerpt: string;
  category: string;
  is_answered: boolean;
  likes: number;
  created_at: string;
  users?: {
    name: string;
  };
  answers?: {
    count: number;
  }[];
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [myths, setMyths] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // Tüm metinler buradan gelir (panelden düzenlenebilir, varsayılanlar her zaman dolu)
  const settings = useSiteSettingsStore((s) => s.settings);
  const c = settings.home;

  useEffect(() => {
    loadAnsweredQuestions();
    faqAPI.getAll().then((d) => setFaqs(d.items || [])).catch(() => {});
    medicalTermsAPI.getAll()
      .then((d) => setMyths((d.terms || []).filter((t: any) => t.mistakeWrong && t.mistakeRight).slice(0, 3)))
      .catch(() => {});
    bannersAPI.getAll().then((d) => setBanners(d.banners || [])).catch(() => {});
  }, []);

  const renderBanner = (b: any) => {
    const inner = (
      <div className="group relative h-48 md:h-56 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
        <ImageWithFallback src={b.imageUrl} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-black text-white mb-1">{b.title}</h3>
          {b.subtitle && <p className="text-sm text-slate-200 line-clamp-2">{b.subtitle}</p>}
        </div>
      </div>
    );
    const key = b.id;
    if (!b.link) return <div key={key}>{inner}</div>;
    if (b.link.startsWith('/')) return <Link key={key} to={b.link}>{inner}</Link>;
    return <a key={key} href={b.link} target="_blank" rel="noopener noreferrer">{inner}</a>;
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
  };

  const loadAnsweredQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select(`
          *,
          users:user_id (name),
          answers (id)
        `)
        .eq('is_answered', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      const formattedQuestions = (data || []).map((q: any) => ({
        ...q,
        answers: q.answers || []
      }));

      setQuestions(formattedQuestions);
    } catch (error: any) {
      console.error('❌ Sorular yüklenirken hata:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays === 1) return '1 gün önce';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Disclaimer'da ilk ":" öncesini kalın göster (örn. "ÖNEMLİ:")
  const disclaimerParts = (() => {
    const text = c.disclaimer || '';
    const idx = text.indexOf(':');
    if (idx === -1) return { head: '', rest: text };
    return { head: text.slice(0, idx + 1), rest: text.slice(idx + 1) };
  })();

  return (
    <div className="w-full bg-stone-50 dark:bg-slate-900">
      <Seo
        title={`${settings.siteName} — Omurga Sağlığı Platformu`}
        description={settings.metaDescription}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'MedicalOrganization',
          name: settings.siteName || 'Omurgam',
          url: 'https://omurgam.com',
          logo: 'https://omurgam.com/assets/logo.svg',
          description: settings.metaDescription,
          founder: {
            '@type': 'Person',
            name: 'Prof. Dr. Defne Kaya Utlu',
            jobTitle: 'Fizyoterapi Profesörü',
          },
        }}
      />
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-36">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120, 53, 15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <Link
              to="/hakkimizda"
              title="Prof. Dr. Defne Kaya Utlu — Özgeçmiş"
              className="inline-flex items-center gap-2.5 pl-1.5 pr-5 py-1.5 bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-amber-200/70 dark:border-slate-700 rounded-full shadow-sm mb-8 hover:border-amber-400 hover:shadow-md transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-[0.08em] uppercase">{c.badge}</span>
            </Link>

            <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter mb-6 leading-[0.9]">
              <span className="block text-slate-900 dark:text-white">{c.title}</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl md:text-4xl font-light text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {c.subtitlePrefix}{' '}
              <span className="font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                {c.subtitleHighlight}
              </span>
              {' '}{c.subtitleSuffix}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/videolar"
                className="group relative px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  <span>{c.ctaVideos && c.ctaVideos !== 'Video Arşivi' ? c.ctaVideos : 'Omurgam Anlatıyor'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/mr-analiz"
                className="group px-8 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold text-lg hover:border-amber-600 hover:bg-amber-50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  <span>{c.ctaGlossary}</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={scrollDown}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden sm:flex cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors">
            <span className="text-xs uppercase tracking-wider font-semibold">{c.scrollText}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2"
            >
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="py-12 px-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(c.stats || []).map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNERLAR */}
      {banners.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className={`grid gap-5 ${banners.length === 1 ? 'grid-cols-1' : banners.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {banners.slice(0, 6).map(renderBanner)}
            </div>
          </div>
        </section>
      )}

      {/* FORUM / COMMUNITY QUESTIONS */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-amber-500/20 text-amber-300 font-bold rounded-full mb-6 text-sm uppercase tracking-wide">
              {c.forumBadge}
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4">
              {c.forumTitle}
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              {c.forumDesc}
            </p>
            <Link
              to="/soru-sor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{c.forumCta}</span>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {isLoadingQuestions ? (
              <div className="col-span-2 text-center">
                <p className="text-xl text-slate-300">{c.forumLoading}</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => window.location.href = `/soru/${question.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={question.users?.name ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={question.users?.name || 'Kullanıcı'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                      />
                      <div>
                        <p className="font-bold text-white">{question.users?.name || 'Kullanıcı'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(question.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold">
                      {question.category}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {question.question}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {question.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{question.answers.length} cevap</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{question.likes}</span>
                      </div>
                    </div>
                    {question.is_answered && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold">
                        <Check className="w-3 h-3" />
                        <span>Cevaplanmış</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/forum"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all group"
            >
              <span>{c.forumViewAll}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* BENTO GRID - Features */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4">
              {c.featuresTitle}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl">
              {c.featuresDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[280px]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-4 md:row-span-2 group"
            >
              <Link
                to="/videolar"
                className="relative h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden p-8 flex flex-col justify-end hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200"
                    alt="Omurgam Anlatıyor"
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-4">
                    <Play className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-bold text-amber-300">{c.cardVideoBadge}</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-3">{c.cardVideoTitle && c.cardVideoTitle !== 'Video Arşivi' ? c.cardVideoTitle : 'Omurgam Anlatıyor'}</h3>
                  <p className="text-lg text-slate-300 mb-6 max-w-lg">
                    {c.cardVideoDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                    <span>{c.cardVideoCta}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="md:col-span-2 md:row-span-1 group"
            >
              <Link
                to="/mr-analiz"
                className="relative h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-3xl overflow-hidden p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 rounded-full flex items-center justify-center group-hover:bg-amber-600 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 text-amber-700 dark:text-amber-300 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{c.cardGlossaryTitle}</h3>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{c.cardGlossaryDesc}</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="md:col-span-2 md:row-span-1 group"
            >
              <Link
                to="/soru-sor"
                className="relative h-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden p-8 flex flex-col justify-between hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-500"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 transition-colors duration-300">
                    <Heart className="w-7 h-7 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-amber-600 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{c.cardAskTitle}</h3>
                  <p className="text-slate-700 dark:text-slate-400 font-medium">{c.cardAskDesc}</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="md:col-span-3 md:row-span-1 group"
            >
              <Link
                to="/blog"
                className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden p-8 flex items-end hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>
                <div className="relative w-full flex items-end justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2">{c.cardBlogTitle}</h3>
                    <p className="text-slate-300 font-medium">{c.cardBlogDesc}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-amber-600 transition-colors duration-300">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="md:col-span-3 md:row-span-1 group"
            >
              <Link
                to="/giris"
                className="relative h-full bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl overflow-hidden p-8 flex items-end hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="absolute top-8 right-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="relative w-full">
                  <h3 className="text-3xl font-black text-white mb-2">{c.cardAccountTitle}</h3>
                  <p className="text-amber-100 font-medium mb-4">{c.cardAccountDesc}</p>
                  <div className="inline-flex items-center gap-2 text-white font-bold">
                    <span>{c.cardAccountCta}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-amber-100 text-amber-900 font-bold rounded-full mb-6 text-sm uppercase tracking-wide">
                {c.whyBadge}
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                {c.whyTitleLine1}<br />
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  {c.whyTitleHighlight}
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                {c.whyDesc}
              </p>
              <div className="space-y-4">
                {(c.whyItems || []).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden">
                <ImageWithFallback
                  src={c.whyImage}
                  alt={c.whyCardName}
                  className="w-full h-[600px] object-cover bg-white"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">{c.whyCardName}</h4>
                        <p className="text-sm text-slate-600">{c.whyCardRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              {c.ctaTitle}
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              {c.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/giris"
                className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <span>{c.ctaPrimary}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                to="/videolar"
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                {c.ctaSecondary}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HAKKIMIZDA (özet) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold rounded-full mb-6 text-sm uppercase tracking-wide">
            Hakkımızda
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">{c.aboutTitle}</h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{c.aboutText}</p>
          <Link
            to="/hakkimizda"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-50 dark:hover:bg-slate-800 transition-all"
          >
            {c.aboutCta} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* SÖZLÜK tanıtımı */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-8 md:p-12">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-3">{c.glossaryTitle}</h2>
                <p className="text-amber-50 text-lg leading-relaxed">{c.glossaryDesc}</p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:items-end">
                <Link to="/saglik-sozlugu" className="px-6 py-3 bg-white text-amber-700 rounded-2xl font-bold text-center hover:scale-105 transition-transform">
                  {c.glossaryCta}
                </Link>
                <Link to="/mr-analiz" className="px-6 py-3 bg-white/15 border border-white/30 text-white rounded-2xl font-bold text-center hover:bg-white/25 transition-colors">
                  MR Terim Sözlüğü
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DOĞRU BİLİNEN YANLIŞLAR */}
      {myths.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">{c.mythsTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">{c.mythsDesc}</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-5">
              {myths.map((m) => (
                <div key={m.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">{m.term}</h3>
                  <div className="flex items-start gap-2 mb-3 text-sm">
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">{m.mistakeWrong}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{m.mistakeRight}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/mit-avi" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform">
                Mit Avı oyununu oyna <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SOSYAL MEDYA */}
      {(settings.instagram || settings.youtube || settings.linkedin || settings.facebook || settings.twitter) && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{c.socialTitle}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{c.socialDesc}</p>
            <div className="flex justify-center gap-3">
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white flex items-center justify-center transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SSS - Sıkça Sorulan Sorular */}
      {faqs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold rounded-full mb-4 text-sm uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" />
                {settings.faq?.badge || 'Sıkça Sorulan Sorular'}
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
                Merak Edilenler
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {settings.faq?.subtitle || 'Platform ve omurga sağlığı hakkında sık sorulan sorular'}
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.slice(0, 8).map((f) => {
                const open = openFaq === f.id;
                return (
                  <div
                    key={f.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-stone-50 dark:bg-slate-900/40"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : f.id)}
                      className="w-full flex items-center justify-between gap-3 p-5 text-left"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {f.icon ? `${f.icon} ` : ''}{f.question}
                      </span>
                      {open ? (
                        <Minus className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {open && (
                      <div className="px-5 pb-5 -mt-1 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {f.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {faqs.length > 8 && (
              <div className="text-center mt-8">
                <Link
                  to="/sorular"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform"
                >
                  <span>Tüm Soruları Gör</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* DISCLAIMER */}
      <section className="py-12 px-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="font-bold text-slate-900 dark:text-white">{disclaimerParts.head}</strong>
            {disclaimerParts.rest}
          </p>
        </div>
      </section>
    </div>
  );
}
