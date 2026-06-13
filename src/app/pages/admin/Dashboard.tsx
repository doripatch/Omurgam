import { Link } from 'react-router';
import { Video, MessageSquare, FileText, Users, TrendingUp, Eye, Clock, CheckCircle, Brain, Settings, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { videosAPI, questionsAPI, blogAPI, adminAPI, termsAPI, medicalTermsAPI } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    videos: 0,
    pendingQuestions: 0,
    blogPosts: 0,
    users: 0,
    mrTerms: 0,
    medicalTerms: 0,
    totalViews: 0,
    answeredQuestions: 0,
  });
  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [videosData, questionsData, blogData, usersData, termsData, medicalTermsData] = await Promise.all([
        videosAPI.getAll(),
        questionsAPI.getAll(),
        blogAPI.getAll(),
        adminAPI.getUsers().catch(() => ({ users: [] })),
        termsAPI.getAll().catch(() => ({ terms: [] })),
        medicalTermsAPI.getAll().catch(() => ({ terms: [] }))
      ]);

      setStats({
        videos: videosData.videos?.length || 0,
        pendingQuestions: questionsData.questions?.filter((q: any) => !q.isAnswered).length || 0,
        blogPosts: blogData.posts?.length || 0,
        users: usersData.users?.length || 0,
        mrTerms: termsData.terms?.length || 0,
        medicalTerms: medicalTermsData.terms?.length || 0,
        totalViews: videosData.videos?.reduce((acc: number, video: any) => acc + video.views, 0) || 0,
        answeredQuestions: questionsData.questions?.filter((q: any) => q.isAnswered).length || 0,
      });

      // Get latest 3 questions
      const latest = (questionsData.questions || [])
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setRecentQuestions(latest);

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Video',
      value: stats.videos.toString(),
      change: `${stats.videos} video`,
      icon: Video,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/videolar'
    },
    {
      title: 'Bekleyen Sorular',
      value: stats.pendingQuestions.toString(),
      change: `${stats.pendingQuestions} soru`,
      icon: MessageSquare,
      color: 'from-amber-500 to-orange-600',
      link: '/admin/sorular'
    },
    {
      title: 'Blog Yazıları',
      value: stats.blogPosts.toString(),
      change: `${stats.blogPosts} yazı`,
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      link: '/admin/blog'
    },
    {
      title: 'MR Terimleri',
      value: stats.mrTerms.toString(),
      change: `${stats.mrTerms} terim`,
      icon: Brain,
      color: 'from-indigo-500 to-purple-600',
      link: '/admin/kosullar'
    },
    {
      title: 'Sağlık Sözlüğü',
      value: stats.medicalTerms.toString(),
      change: `${stats.medicalTerms} terim`,
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      link: '/admin/saglik-sozlugu'
    },
    {
      title: 'Kayıtlı Kullanıcı',
      value: stats.users.toString(),
      change: `${stats.users} kullanıcı`,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/kullanicilar'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Omurgam Soruyor Yönetim Paneli</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={stat.title}
              to={stat.link}
              onClick={() => console.log(`🎯 Tıklanan kart: "${stat.title}" -> Link: "${stat.link}"`)}
              className="group relative backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl p-6 hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              
              <div className="relative">
                {/* DEBUG: Kart numarası */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white font-bold rounded-full flex items-center justify-center text-lg z-10 shadow-lg">
                  {index + 1}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.title}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Questions */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Son Sorular</h2>
              <Link to="/admin/sorular" className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                Tümünü Gör →
              </Link>
            </div>

            <div className="space-y-3">
              {recentQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-teal-600">{q.username}</div>
                    {q.status === 'answered' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        Yanıtlandı
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Bekliyor
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{q.question}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {q.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Hızlı İşlemler</h2>
            
            <div className="space-y-3">
              <Link
                to="/admin/videolar"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Video Ekle</div>
                  <div className="text-xs text-slate-600">Yeni içerik yükle</div>
                </div>
              </Link>

              <Link
                to="/admin/blog"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Blog Yaz</div>
                  <div className="text-xs text-slate-600">Yeni yazı oluştur</div>
                </div>
              </Link>

              <Link
                to="/admin/sorular"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Soruları Onayla</div>
                  <div className="text-xs text-slate-600">{stats.pendingQuestions} bekleyen soru</div>
                </div>
              </Link>

              <Link
                to="/admin/kosullar"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">MR Terim Ekle</div>
                  <div className="text-xs text-slate-600">{stats.mrTerms} terim</div>
                </div>
              </Link>

              <Link
                to="/admin/saglik-sozlugu"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Sağlık Sözlüğü</div>
                  <div className="text-xs text-slate-600">{stats.medicalTerms} terim</div>
                </div>
              </Link>

              <Link
                to="/admin/site-ayarlari"
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Site Ayarları</div>
                  <div className="text-xs text-slate-600">İçerikleri düzenle</div>
                </div>
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="mt-6 pt-6 border-t border-purple-200">
              <h3 className="font-semibold text-slate-900 mb-4">Platform İstatistikleri</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Eye className="w-4 h-4" />
                    Toplam Görüntülenme
                  </div>
                  <div className="font-bold text-slate-900">{stats.totalViews.toLocaleString('tr-TR')}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4" />
                    Yanıtlanan Sorular
                  </div>
                  <div className="font-bold text-emerald-600">{stats.answeredQuestions}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                    Toplam Soru
                  </div>
                  <div className="font-bold text-slate-900">{stats.pendingQuestions + stats.answeredQuestions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}