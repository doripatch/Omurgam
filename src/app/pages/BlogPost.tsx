import { ArrowLeft, Clock, Eye, Tag } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { blogAPI } from '../lib/api';
import { toast } from 'sonner';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  views: number;
  published: boolean;
  created_at: string;
}

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 BlogPost ID:', id);
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
      console.log('📥 Blog yazısı yükleniyor, ID:', postId);
      const data = await blogAPI.getById(postId);
      console.log('✅ Blog yazısı yüklendi:', data);
      setPost(data.post);
    } catch (error: any) {
      console.error('❌ Blog yükleme hatası:', error);
      setError(error.message || 'Blog yazısı yüklenemedi');
      toast.error('Blog yazısı yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Blog'a Dön
        </Link>
        
        <div className="backdrop-blur-xl bg-white/90 border border-amber-200/30 rounded-3xl p-8 md:p-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">İçerik yükleniyor...</p>
            </div>
          ) : post ? (
            <>
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">{post.title}</h1>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDate(post.created_at)}</span>
                </div>
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
                <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
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