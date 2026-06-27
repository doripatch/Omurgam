import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ThumbsUp, MessageSquare, Eye, ArrowLeft, Send, Trash2, Clock, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { videosAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import FavoriteButton from '../components/FavoriteButton';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  views: number;
  createdAt: string;
  published: boolean;
}

interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  createdAt: string;
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

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeStatus, setLikeStatus] = useState({ liked: false, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Load video data
  useEffect(() => {
    if (!id) return;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        const videoData = await videosAPI.getById(id);
        setVideo(videoData);

        // Increment view count
        await videosAPI.incrementViews(id);
        
        // Load related videos (same category)
        const allVideosData = await videosAPI.getAll();
        const related = (allVideosData.videos || [])
          .filter((v: Video) => 
            v.id !== id && 
            v.published && 
            v.category === videoData.category
          )
          .slice(0, 5);
        setRelatedVideos(related);
      } catch (error: any) {
        console.error('Error loading video:', error);
        toast.error('Video yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [id]);

  // Load comments
  useEffect(() => {
    if (!id) return;

    const loadComments = async () => {
      try {
        const data = await videosAPI.getComments(id);
        setComments(data.comments || []);
      } catch (error: any) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();
  }, [id]);

  // Load like status
  useEffect(() => {
    if (!id) return;

    const loadLikeStatus = async () => {
      try {
        const status = await videosAPI.getLikeStatus(id);
        setLikeStatus(status);
      } catch (error: any) {
        console.error('Error loading like status:', error);
      }
    };

    loadLikeStatus();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Beğenmek için giriş yapmalısınız');
      navigate('/giris');
      return;
    }

    if (!id) return;

    try {
      const result = await videosAPI.toggleLike(id);
      setLikeStatus({
        liked: result.liked,
        count: result.liked ? likeStatus.count + 1 : likeStatus.count - 1
      });
      toast.success(result.liked ? 'Beğenildi! ❤️' : 'Beğeni kaldırıldı');
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Beğeni işlemi başarısız');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız');
      navigate('/giris');
      return;
    }

    if (!commentText.trim() || !id) return;

    try {
      setIsSubmittingComment(true);
      const newComment = await videosAPI.addComment(id, commentText.trim());
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Yorumunuz eklendi! 💬');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Yorum eklenemedi');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    if (!id) return;

    try {
      await videosAPI.deleteComment(id, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Yorum silindi');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error('Yorum silinemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Video bulunamadı</h1>
        <Link to="/videolar" className="text-amber-600 hover:underline">
          Video arşivine dön
        </Link>
      </div>
    );
  }

  const youtubeVideoId = getYouTubeVideoId(video.videoUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/videolar"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Omurgam Anlatıyor'a Dön</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-amber-500/10">
              {youtubeVideoId ? (
                <div className="relative pt-[56.25%]">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-slate-200 flex items-center justify-center">
                  <p className="text-slate-600">Geçersiz video URL</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-amber-500/10">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{video.title}</h1>
                <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-full flex-shrink-0">
                  {video.category}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{video.views.toLocaleString('tr-TR')} görüntülenme</span>
                </div>
                {video.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                    likeStatus.liked
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${likeStatus.liked ? 'fill-current' : ''}`} />
                  <span>{likeStatus.count} Beğeni</span>
                </button>

                <FavoriteButton type="video" itemId={video.id} title={video.title} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" />

                <div className="flex items-center gap-2 text-slate-600">
                  <MessageSquare className="w-5 h-5" />
                  <span>{comments.length} Yorum</span>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Açıklama</h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-amber-500/10">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Yorumlar ({comments.length})
              </h3>

              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows={3}
                    placeholder="Yorumunuzu yazın..."
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>Gönder</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-center">
                  <p className="text-amber-900 mb-3">Yorum yapmak için giriş yapmalısınız</p>
                  <Link
                    to="/giris"
                    className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-2xl hover:bg-amber-700 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900">{comment.userName}</h4>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                          </p>
                        </div>
                        {(user?.id === comment.userId || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Yorumu sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-amber-500/10 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">İlgili Videolar</h3>
              
              {relatedVideos.length === 0 ? (
                <p className="text-sm text-slate-600">Aynı kategoride başka video bulunamadı.</p>
              ) : (
                <div className="space-y-4">
                  {relatedVideos.map((relVideo) => {
                    const relThumbnail = relVideo.thumbnailUrl || `https://img.youtube.com/vi/${getYouTubeVideoId(relVideo.videoUrl)}/hqdefault.jpg`;
                    
                    return (
                      <Link
                        key={relVideo.id}
                        to={`/video/${relVideo.id}`}
                        className="group block"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                          <img
                            src={relThumbnail}
                            alt={relVideo.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {relVideo.duration && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/80 text-white text-xs rounded">
                              {relVideo.duration}
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-1">
                          {relVideo.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Eye className="w-3 h-3" />
                          <span>{relVideo.views.toLocaleString('tr-TR')}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}