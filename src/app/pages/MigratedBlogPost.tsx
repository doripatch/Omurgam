// Faz 1 — Yeni aile URL'lerinde blog detayı: /saglikli-yasam/:slug,
// /omurgam-ne-diyor/:slug, /yatak-yastik-rehberi/:slug
// slug -> UUID (merkezi harita) -> mevcut blog API'sinden AYNI kayıt.
// İçerik metni, görüntülenme sayacı ve favori davranışı DEĞİŞTİRİLMEZ.
// Eski /blog/:id route'u ve davranışı bu dosyadan etkilenmez.
import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router';
import { ArrowLeft, Clock, Eye, Tag } from 'lucide-react';
import { blogAPI } from '../lib/api';
import { toast } from 'sonner';
import Seo from '../components/Seo';
import FavoriteButton from '../components/FavoriteButton';
import AuthorBox from '../components/AuthorBox';
import RichText, { hasMarkdown } from '../components/RichText';
import { ORIGIN, BASE_TO_FAMILY, FAMILY_META, idByBaseSlug, recordById } from '../lib/urlMigration';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  readingTime?: string;
  views: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

function NotFound() {
  return (
    <div className="w-full min-h-[60vh] flex items-center">
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <Seo title="İçerik bulunamadı" description="Aradığınız yazı taşınmış veya adres yanlış yazılmış olabilir." />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">İçerik bulunamadı</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-7">Aradığınız yazı taşınmış veya adres yanlış yazılmış olabilir.</p>
        <Link to="/" className="inline-flex rounded-full bg-amber-700 px-5 py-3 font-semibold text-white">Ana sayfaya dön</Link>
      </div>
    </div>
  );
}

export default function MigratedBlogPost() {
  const { slug } = useParams();
  const location = useLocation();
  const base = location.pathname.replace(/^\/+/, '').split('/')[0];
  const family = BASE_TO_FAMILY[base];
  const id = idByBaseSlug(base, slug);
  const rec = recordById(id);

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await blogAPI.getById(id);
        if (active) setPost(data.post);
        // Görüntülenme sayacı: eski davranışla BİREBİR aynı (UUID ile).
        blogAPI.incrementViews(id).catch(() => {});
      } catch (error: any) {
        if (active) toast.error('Yazı yüklenemedi');
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Geçersiz slug / bilinmeyen aile: başka kaydı ASLA gösterme.
  if (!family || !id || !rec) return <NotFound />;

  const meta = FAMILY_META[family];
  const canonical = `${ORIGIN}${rec.newUrl}`;
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || undefined,
        articleSection: post.category,
        inLanguage: 'tr-TR',
        datePublished: post.createdAt || post.created_at,
        dateModified: post.updatedAt || post.createdAt || post.created_at,
        image: post.imageUrl || `${ORIGIN}/assets/logo-og.png`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@id': `${ORIGIN}/#defne-kaya-utlu` },
        publisher: { '@id': `${ORIGIN}/#org` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: meta.name, item: `${ORIGIN}${meta.base}` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  } : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
      <Seo
        title={post?.title || meta.name}
        description={post?.excerpt || (post?.content ? post.content.slice(0, 155) : meta.name)}
        image={post?.imageUrl}
        type="article"
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <div className="max-w-4xl mx-auto">
        <Link to={meta.base} className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="w-4 h-4" /> {meta.name}
        </Link>

        <div className="backdrop-blur-xl bg-white/90 border border-amber-200/30 rounded-3xl p-8 md:p-12 dark:bg-slate-900/80 dark:border-slate-700">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">İçerik yükleniyor...</p>
            </div>
          ) : post ? (
            <>
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden mb-8 -mt-2">
                  <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">{post.category}</span>
              </div>
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white flex-1">{post.title}</h1>
                <FavoriteButton type="blog" itemId={post.id} title={post.title} label={false} className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 text-slate-600 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-sm">{formatDate(post.createdAt || post.created_at)}</span></div>
                {post.readingTime && <div className="flex items-center gap-2 text-amber-700"><Clock className="w-4 h-4" /><span className="text-sm font-medium">{post.readingTime} okuma</span></div>}
                <div className="flex items-center gap-2"><Eye className="w-4 h-4" /><span className="text-sm">{post.views.toLocaleString('tr-TR')} görüntülenme</span></div>
              </div>
              {post.excerpt && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-8 dark:bg-amber-950/20">
                  <p className="text-lg text-slate-700 dark:text-slate-200 italic">{post.excerpt}</p>
                </div>
              )}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {hasMarkdown(post.content)
                  ? <RichText text={post.content} />
                  : <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</div>}
              </div>
              <AuthorBox updatedDate={formatDate(post.updatedAt || post.createdAt || post.created_at)} />
            </>
          ) : (
            <div className="text-center py-12"><p className="text-slate-600 dark:text-slate-300">Yazı bulunamadı</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
