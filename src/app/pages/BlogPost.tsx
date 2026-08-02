import { ArrowLeft, Clock, Eye, Tag } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { blogAPI } from '../lib/api';
import { toast } from 'sonner';
import Seo from '../components/Seo';
import FavoriteButton from '../components/FavoriteButton';
import AuthorBox from '../components/AuthorBox';
import RichText, { hasMarkdown } from '../components/RichText';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  readingTime?: string;
  section?: string;
  views: number;
  published: boolean;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

function sectionMeta(section?: string) {
  if (section === 'kaleminden') return { path: '/omurgam-ne-diyor', name: 'Omurga Sağlığı Yazıları' };
  if (section === 'saglikli-yasam') return { path: '/saglikli-yasam', name: 'Sağlıklı Yaşam' };
  if (section === 'yatak-yastik') return { path: '/yatak-yastik-rehberi', name: 'Yatak ve Yastık Seçim Rehberi' };
  return { path: '/blog', name: 'Blog' };
}

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost(id);
    } else {
      setError('Blog ID bulunamadı');
      setIsLoading(false);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await blogAPI.getById(postId);
      setPost(data.post);
      // Görüntülenmeyi artır (hata olsa da sayfayı etkilemesin)
      blogAPI.incrementViews(postId).catch(() => {});
    } catch (error: any) {
      console.error('❌ Blog yükleme hatası:', error);
      setError(error.message || 'Blog yazısı yüklenemedi');
      toast.error('Blog yazısı yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
      <Seo
        title={post?.title || 'Blog'}
        description={post?.excerpt || (post?.content ? post.content.slice(0, 155) : 'Omurga sağlığı hakkında blog yazıları.')}
        image={post?.imageUrl}
        type="article"
        jsonLd={post ? {
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
              image: post.imageUrl || 'https://omurgam.com/assets/logo-og.png',
              mainEntityOfPage: { '@type': 'WebPage', '@id': `https://omurgam.com/blog/${post.id}` },
              author: { '@type': 'Person', name: 'Prof. Dr. Defne Kaya Utlu', jobTitle: 'Fizyoterapi Profesörü' },
              publisher: { '@type': 'Organization', name: 'Omurgam', logo: { '@type': 'ImageObject', url: 'https://omurgam.com/assets/logo-og.png' } },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://omurgam.com/' },
                { '@type': 'ListItem', position: 2, name: sectionMeta(post.section).name, item: `https://omurgam.com${sectionMeta(post.section).path}` },
                { '@type': 'ListItem', position: 3, name: post.title },
              ],
            },
          ],
        } : null}
      />
      <div className="max-w-4xl mx-auto">
        <Link to={post ? sectionMeta(post.section).path : '/blog'} className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="w-4 h-4" />
          {post ? sectionMeta(post.section).name : 'Blog'}
        </Link>
        
        <div className="backdrop-blur-xl bg-white/90 border border-amber-200/30 rounded-3xl p-8 md:p-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">İçerik yükleniyor...</p>
            </div>
          ) : post ? (
            <>
              {/* Kapak Görseli */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden mb-8 -mt-2">
                  <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-cover" />
                </div>
              )}

              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 flex-1">{post.title}</h1>
                <FavoriteButton type="blog" itemId={post.id} title={post.title} label={false} className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 text-slate-600 flex-shrink-0" />
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDate(post.createdAt || post.created_at)}</span>
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.readingTime} okuma</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{post.views.toLocaleString('tr-TR')} görüntülenme</span>
                </div>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-8">
                  <p className="text-lg text-slate-700 italic">{post.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {hasMarkdown(post.content) ? (
                  <RichText text={post.content} />
                ) : (
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                )}
              </div>

              <AuthorBox updatedDate={formatDate(post.updatedAt || post.createdAt || post.created_at)} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Blog yazısı bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}