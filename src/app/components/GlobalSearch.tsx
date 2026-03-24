import { useState, useEffect } from 'react';
import { Search, X, FileText, Video, HelpCircle, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { Link } from 'react-router';

interface SearchResult {
  id: string;
  type: 'blog' | 'video' | 'question' | 'term';
  title: string;
  description: string;
  url: string;
  category?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Blog araması
      const { data: blogData } = await supabase
        .from(TABLES.BLOG_POSTS)
        .select('id, title, excerpt, category')
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (blogData) {
        blogData.forEach(post => {
          searchResults.push({
            id: post.id,
            type: 'blog',
            title: post.title,
            description: post.excerpt,
            url: `/blog/${post.id}`,
            category: post.category
          });
        });
      }

      // Video araması
      const { data: videoData } = await supabase
        .from(TABLES.VIDEOS)
        .select('id, title, description, category')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (videoData) {
        videoData.forEach(video => {
          searchResults.push({
            id: video.id,
            type: 'video',
            title: video.title,
            description: video.description,
            url: `/videolar`,
            category: video.category
          });
        });
      }

      // Soru araması
      const { data: questionData } = await supabase
        .from(TABLES.QUESTIONS)
        .select('id, question, excerpt, category')
        .or(`question.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .eq('is_answered', true)
        .limit(5);

      if (questionData) {
        questionData.forEach(q => {
          searchResults.push({
            id: q.id,
            type: 'question',
            title: q.question,
            description: q.excerpt,
            url: `/soru/${q.id}`,
            category: q.category
          });
        });
      }

      // MR Terim araması
      const { data: termData } = await supabase
        .from(TABLES.MR_TERMS)
        .select('id, term, definition')
        .or(`term.ilike.%${searchQuery}%,definition.ilike.%${searchQuery}%`)
        .limit(5);

      if (termData) {
        termData.forEach(term => {
          searchResults.push({
            id: term.id,
            type: 'term',
            title: term.term,
            description: term.definition.substring(0, 100) + '...',
            url: `/mr-analiz`
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-green-500" />;
      case 'term':
        return <FileText className="w-5 h-5 text-purple-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'video':
        return 'Video';
      case 'question':
        return 'Soru';
      case 'term':
        return 'Terim';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Blog, video, soru veya terim ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-lg"
          />
          {isSearching && (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aramak için en az 2 karakter girin</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sonuç bulunamadı</p>
              <p className="text-sm mt-2">Farklı bir arama terimi deneyin</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.url}
                  onClick={onClose}
                  className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-b-0"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.category && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {result.category}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {result.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {results.length > 0 && `${results.length} sonuç bulundu`}
            </span>
            <span>
              ESC ile kapat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
