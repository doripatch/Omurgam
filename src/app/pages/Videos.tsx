import { useState, useEffect } from 'react';
import { Play, Search, Filter, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import ExerciseTracker from '../components/ExerciseTracker';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { videosAPI } from '../lib/api';

interface Video {
  id: string;
  title: string;
  category: string;
  duration?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  description?: string;
  views?: number;
  published?: boolean;
  videoUrl?: string;
}

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(false);
  const { addCompletedExercise } = useStore();

  // Fetch videos from API
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videosAPI.getAll();
      // Only show published videos
      const publishedVideos = (data.videos || []).filter((v: Video) => v.published);
      setVideos(publishedVideos);
    } catch (error) {
      console.error('Load videos error:', error);
      toast.error('Videolar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Tümü', 'Bel Fıtığı', 'Boyun Ağrısı', 'Skolyoz', 'Postür', 'Egzersiz', 'Genel'];

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'Tümü' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCompleteExercise = (video: Video) => {
    // Add session to store
    addCompletedExercise({
      videoId: video.id,
      videoTitle: video.title,
      duration: video.duration ? parseInt(video.duration) : 0,
    });

    // Show celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Toast notification
    toast.success('🎉 Tebrikler!', {
      description: `${video.title} tamamlandı! ${video.duration} dakika egzersiz yaptın.`,
    });
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
            Video Arşivi
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Profesyonel rehberliğinde egzersiz videoları
          </p>
        </div>

        {/* Exercise Tracker Dashboard */}
        {showTracker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                İlerleme Takibi
              </h2>
              <button
                onClick={() => setShowTracker(!showTracker)}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 transition-colors"
              >
                {showTracker ? 'Gizle' : 'Göster'}
              </button>
            </div>
            <ExerciseTracker />
          </motion.div>
        )}

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-3xl p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Video ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-slate-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-stone-200 dark:border-slate-700 hover:border-amber-600 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Thumbnail */}
              <Link to={`/video/${video.id}`}>
                <div className="relative aspect-video overflow-hidden cursor-pointer">
                  <img
                    src={video.thumbnailUrl || video.thumbnail || 'https://via.placeholder.com/600'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}dk</span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-amber-600/90 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase tracking-wide">
                    {video.category}
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                <Link to={`/video/${video.id}`}>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors cursor-pointer">
                    {video.title}
                  </h3>
                </Link>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {video.description}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link to={`/video/${video.id}`} className="flex-1">
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-105">
                      İzle
                    </button>
                  </Link>
                  <button
                    onClick={() => handleCompleteExercise(video)}
                    className="px-4 py-2.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    ✓ Tamamla
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sonuç Bulunamadı
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Arama kriterlerinize uygun video bulunamadı. Farklı bir arama deneyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}