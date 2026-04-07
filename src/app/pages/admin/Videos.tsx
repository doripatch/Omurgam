import { useState, useEffect } from 'react';
import { Plus, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { videosAPI } from '../../lib/api';

interface Video {
  id: string;
  title: string;
  category: string;
  views: number;
  published: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  duration?: string;
}

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Get YouTube thumbnail URL
const getYouTubeThumbnail = (videoUrl: string): string | null => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export default function AdminVideos() {
  // 🎬 VIDEO YÖNETİMİ SAYFASI - v2.0
  const [showAddModal, setShowAddModal] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Component mounted
  useEffect(() => {
  }, []);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Bel Fıtığı',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    published: true // Varsayılan olarak yayınlansın
  });

  // Fetch videos from API
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videosAPI.getAll();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Load videos error:', error);
      toast.error('Videolar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.videoUrl) {
      toast.error('Başlık ve video URL gerekli');
      return;
    }

    try {
      await videosAPI.create(formData);
      toast.success('Video başarıyla eklendi!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Bel Fıtığı',
        videoUrl: '',
        thumbnailUrl: '',
        duration: '',
        published: true // Varsayılan olarak yayınlansın
      });
      loadVideos(); // Reload videos
    } catch (error: any) {
      toast.error(error.message || 'Video eklenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu videoyu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await videosAPI.delete(id);
      toast.success('Video silindi');
      loadVideos(); // Reload videos
    } catch (error: any) {
      toast.error(error.message || 'Video silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) {
      toast.error('Lütfen en az bir video seçin');
      return;
    }

    if (!confirm(`${selectedVideos.length} videoyu silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      for (const id of selectedVideos) {
        await videosAPI.delete(id);
      }
      toast.success(`${selectedVideos.length} video silindi`);
      setSelectedVideos([]);
      setIsDeleteMode(false);
      loadVideos();
    } catch (error: any) {
      toast.error(error.message || 'Videolar silinirken hata oluştu');
    }
  };

  const toggleVideoSelection = (id: string) => {
    setSelectedVideos(prev =>
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(v => v.id));
    }
  };

  const handleTogglePublish = async (video: Video) => {
    try {
      await videosAPI.update(video.id, { published: !video.published });
      toast.success(video.published ? 'Video taslak yapıldı' : 'Video yayınlandı');
      loadVideos(); // Reload videos
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  // Fix thumbnails for all videos
  const handleFixAllThumbnails = async () => {
    if (!confirm('Tüm videoların thumbnail\'larını YouTube\'dan otomatik çekmek ister misiniz?')) {
      return;
    }

    try {
      let fixedCount = 0;
      for (const video of videos) {
        // If thumbnail is missing or empty, extract from YouTube URL
        if (video.videoUrl && (!video.thumbnailUrl || video.thumbnailUrl.trim() === '')) {
          const videoId = getYouTubeVideoId(video.videoUrl);
          if (videoId) {
            const newThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            await videosAPI.update(video.id, { thumbnailUrl: newThumbnail });
            fixedCount++;
          }
        }
      }
      toast.success(`${fixedCount} videonun thumbnail'ı güncellendi! 🎉`);
      loadVideos();
    } catch (error: any) {
      toast.error('Thumbnail güncelleme hatası: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Video Yönetimi</h1>
            <p className="text-slate-600">Tüm videoları yönetin</p>
          </div>
          <div className="flex gap-3">
            {!isDeleteMode ? (
              <>
                <button
                  onClick={handleFixAllThumbnails}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <Upload className="w-5 h-5" />
                  Thumbnail Yenile
                </button>
                <button
                  onClick={() => setIsDeleteMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                  Toplu Sil
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Video
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedVideos.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                  Seçilenleri Sil ({selectedVideos.length})
                </button>
                <button
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedVideos([]);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-300 transition-all"
                >
                  İptal
                </button>
              </>
            )}
          </div>
        </div>

        {/* Videos Table */}
        <div className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Videolar yükleniyor...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 mb-4">Henüz video eklenmemiş</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
              >
                İlk Videoyu Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                  <tr>
                    {isDeleteMode && (
                      <th className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedVideos.length === videos.length && videos.length > 0}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Başlık</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Görüntülenme</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
                    {!isDeleteMode && (
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">İşlemler</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-purple-50/50 transition-colors">
                      {isDeleteMode && (
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedVideos.includes(video.id)}
                            onChange={() => toggleVideoSelection(video.id)}
                            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{video.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {video.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Eye className="w-4 h-4" />
                          {video.views?.toLocaleString('tr-TR') || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(video)}
                          className="cursor-pointer"
                        >
                          {video.published ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                              Yayında
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                              Taslak
                            </span>
                          )}
                        </button>
                      </td>
                      {!isDeleteMode && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Yeni Video Ekle</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Video Başlığı *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Örn: Bel Fıtığı Egzersizleri"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    placeholder="Video hakkında kısa açıklama..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">YouTube URL *</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {formData.videoUrl && getYouTubeVideoId(formData.videoUrl) && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-600 mb-2">📸 Otomatik Thumbnail Önizlemesi:</p>
                      <img
                        src={getYouTubeThumbnail(formData.videoUrl) || ''}
                        alt="YouTube Thumbnail"
                        className="w-full max-w-md rounded-xl border-2 border-slate-200"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault fails
                          const videoId = getYouTubeVideoId(formData.videoUrl);
                          if (videoId) {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Küçük Resim URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://... (boş bırakılırsa YouTube'dan otomatik alınır)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option key="bel-fitigi">Bel Fıtığı</option>
                      <option key="boyun-agrisi">Boyun Ağrısı</option>
                      <option key="skolyoz">Skolyoz</option>
                      <option key="postur">Postür</option>
                      <option key="egzersiz">Egzersiz</option>
                      <option key="genel">Genel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Süre</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Örn: 12:45"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                  >
                    Video Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}