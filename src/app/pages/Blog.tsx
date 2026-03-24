import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { blogAPI } from '../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  published?: boolean;
  views?: number;
  createdAt?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await blogAPI.getAll();
      console.log('📚 Blog sayfası - tüm yazılar:', data.posts);
      const publishedPosts = (data.posts || []).filter((p: BlogPost) => p.published);
      console.log('✅ Blog sayfası - yayında olanlar:', publishedPosts);
      setPosts(publishedPosts);
    } catch (error) {
      console.error('❌ Load posts error:', error);
      toast.error('Blog yazıları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Blog yazıları yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Blog</h1>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-amber-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Henüz Blog Yazısı Yok</h3>
            <p className="text-slate-600">Yakında yeni yazılar eklenecek!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-white rounded-3xl overflow-hidden border-2 border-stone-200 hover:border-amber-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
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
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}