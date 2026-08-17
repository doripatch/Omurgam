import { Search, PenTool, Leaf, Clock, BedDouble } from 'lucide-react';
import { useState, useEffect } from 'react';
import { blogAPI } from '../lib/api';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router';
import Seo from '../components/Seo';
import { newUrlById } from '../lib/urlMigration';

// Kart/başlık navigasyon URL'si: merkezi haritadan yeni aile URL'si.
// Manifest'te olmayan beklenmedik kayıt için eski /blog/<UUID>'ye güvenli fallback + DEV uyarısı.
function postHref(id: string): string {
  const u = newUrlById(id);
  if (u) return u;
  if (import.meta.env.DEV) console.warn(`[Blog] "${id}" manifest'te yok — /blog/${id} fallback kullanıldı.`);
  return `/blog/${id}`;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  section?: string;
  readingTime?: string;
  published?: boolean;
  views?: number;
  createdAt?: string;
}

const SECTIONS: Record<string, { title: string; desc: string; accent: string }> = {
  'saglikli-yasam': {
    title: 'Sağlıklı Yaşam',
    desc: 'Genel sağlık, yaşam kalitesi ve iyi yaşam üzerine yazılar.',
    accent: 'emerald',
  },
  'kaleminden': {
    title: 'Omurga Sağlığı Yazıları',
    desc: 'Omurga sağlığına dair bilimsel makaleler ve değerlendirmeler.',
    accent: 'amber',
  },
  'yatak-yastik': {
    title: 'Yatak ve Yastık Seçim Rehberi',
    desc: 'Omurga sağlığınız için doğru yatak ve yastığı seçmenize yardımcı olacak rehber yazılar.',
    accent: 'amber',
  },
};

export default function Blog() {
  const location = useLocation();
  const section = location.pathname.includes('saglikli-yasam')
    ? 'saglikli-yasam'
    : location.pathname.includes('yatak-yastik')
    ? 'yatak-yastik'
    : 'kaleminden';
  const meta = SECTIONS[section];

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [section]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await blogAPI.getAll();
      const publishedPosts = (data.posts || [])
        .filter((p: BlogPost) => p.published)
        .filter((p: BlogPost) => (p.section || 'saglikli-yasam') === section);
      setPosts(publishedPosts);
    } catch (error) {
      console.error('❌ Load posts error:', error);
      toast.error('Yazılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = section === 'saglikli-yasam' ? Leaf : section === 'yatak-yastik' ? BedDouble : PenTool;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Yazılar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <Seo
        title={meta.title}
        description={meta.desc}
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: meta.title,
              description: meta.desc,
              inLanguage: 'tr-TR',
              url: `https://omurgam.com${section === 'saglikli-yasam' ? '/saglikli-yasam' : section === 'yatak-yastik' ? '/yatak-yastik-rehberi' : '/omurgam-ne-diyor'}`,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://omurgam.com/' },
                { '@type': 'ListItem', position: 2, name: meta.title },
              ],
            },
            {
              '@type': 'ItemList',
              itemListElement: posts.slice(0, 40).map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: p.title,
                url: `https://omurgam.com${postHref(p.id)}`,
              })),
            },
          ],
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-4">
            <Icon className="w-4 h-4" />
            <span>{section === 'saglikli-yasam' ? 'Sağlıklı Yaşam' : section === 'yatak-yastik' ? 'Rehber' : 'Makaleler'}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">{meta.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{meta.desc}</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-amber-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Henüz Yazı Yok</h3>
            <p className="text-slate-600 dark:text-slate-400">Yakında yeni yazılar eklenecek!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={postHref(post.id)}
                className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-stone-200 dark:border-slate-700 hover:border-amber-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                {post.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">
                      {post.category}
                    </span>
                    {post.readingTime && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" /> {post.readingTime}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-amber-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
