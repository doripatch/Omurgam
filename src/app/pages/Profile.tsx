import { useState, useEffect } from 'react';
import { User, Mail, Calendar, MessageSquare, FileText, AtSign, Loader2, Shield, Clock, Check, Edit, Key, LogOut, X, Save } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  initials: string;
  isAdmin: boolean;
  role: string;
  createdAt: string;
  stats: {
    questionsCount: number;
    videosWatched: number;
    status: string;
  };
}

interface Question {
  id: string;
  question: string;
  excerpt: string;
  category: string;
  is_answered: boolean;
  created_at: string;
  users?: {
    name: string;
  };
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const navigate = useNavigate();
  const signout = useAuthStore((state) => state.signout);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchQuestions();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user from Supabase auth
      console.log('🔍 Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ User error:', userError);
        setError('Kullanıcı bilgileri alınamadı: ' + userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        console.error('❌ No user found - user needs to login');
        setError('Oturum bulunamadı. Lütfen giriş yapın.');
        setLoading(false);
        return;
      }

      console.log('✅ User found:', user.email, 'ID:', user.id);

      const email = user.email ?? '';
      
      // Get user metadata
      const metadata = user.user_metadata || {};
      let fullName = metadata.name || metadata.full_name || '';
      
      // Extract first and last name
      let firstName = '';
      let lastName = '';
      
      if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        // Derive from email
        const emailName = email.split('@')[0];
        if (emailName.includes('.')) {
          const parts = emailName.split('.');
          firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        } else {
          firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }

      // Generate username from email
      const username = email.split('@')[0].toLowerCase();

      // Check if user is admin
      const isAdmin = email === 'defne.kayautlu@omurgam.com' || 
                     email === 'dorukhan.sayim@omurgam.com' ||
                     email === 'ceyhan.utlu@omurgam.com';

      // Get question count
      const { count } = await supabase
        .from(TABLES.QUESTIONS)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get user stats
      const stats = {
        questionsCount: count || 0,
        videosWatched: 0,
        status: 'Aktif'
      };

      // Format created date
      const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Bilinmiyor';

      const profileData: UserProfile = {
        id: user.id,
        email,
        firstName,
        lastName,
        fullName: fullName || `${firstName} ${lastName}`.trim(),
        username,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
        isAdmin,
        role: isAdmin ? 'Admin' : 'Kullanıcı',
        createdAt,
        stats
      };

      console.log('✅ Profile data prepared:', profileData);
      setProfile(profileData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      setError(`Bir hata oluştu: ${err instanceof Error ? err.message : 'Lütfen tekrar deneyin'}`);
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!profile) return;

    try {
      setLoadingQuestions(true);
      console.log('📥 Profil soruları yükleniyor...');

      if (profile.isAdmin) {
        // Admin: Cevapladığı soruları göster
        const { data, error } = await supabase
          .from(TABLES.ANSWERS)
          .select(`
            question_id,
            created_at,
            questions (
              id,
              question,
              excerpt,
              category,
              is_answered,
              created_at,
              users:user_id (name)
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Flatten the data
        const formattedQuestions = (data || []).map((item: any) => ({
          ...item.questions,
          answered_at: item.created_at
        }));

        console.log('✅ Admin soruları yüklendi:', formattedQuestions);
        setQuestions(formattedQuestions);
      } else {
        // Normal kullanıcı: Kendi sorduğu soruları göster
        const { data, error } = await supabase
          .from(TABLES.QUESTIONS)
          .select(`
            id,
            question,
            excerpt,
            category,
            is_answered,
            created_at,
            users:user_id (name)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        console.log('✅ Kullanıcı soruları yüklendi:', data);
        setQuestions(data || []);
      }
    } catch (err) {
      console.error('❌ Sorular yüklenirken hata:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays === 1) return '1 gün önce';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/90 border border-red-200/30 rounded-3xl p-8 max-w-md">
          <p className="text-red-600 text-center">{error || 'Profil bilgileri yüklenemedi.'}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 w-full bg-teal-600 text-white py-3 rounded-2xl hover:bg-teal-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Profilim</h1>

        {/* Profile Card */}
        <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
                {profile.isAdmin && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  <span className="font-semibold text-teal-600">{profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Üyelik: {profile.createdAt}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setEditName(profile.fullName);
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-2 bg-teal-600 text-white py-2 px-4 rounded-2xl hover:bg-teal-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Profili Düzenle
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white py-2 px-4 rounded-2xl hover:bg-amber-700 transition-colors"
            >
              <Key className="w-4 h-4" />
              Şifre Değiştir
            </button>
            <button
              onClick={() => {
                signout();
                navigate('/giris');
              }}
              className="inline-flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-2xl hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 text-center">
            <MessageSquare className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">{profile.stats.questionsCount}</div>
            <div className="text-slate-600">Sorularım</div>
          </div>
          <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 text-center">
            <FileText className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">{profile.stats.videosWatched}</div>
            <div className="text-slate-600">İzlenen Video</div>
          </div>
          <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-6 text-center">
            <User className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 mb-1">{profile.stats.status}</div>
            <div className="text-slate-600">Durum</div>
          </div>
        </div>

        {/* Recent Questions Section */}
        <div className="backdrop-blur-xl bg-white/80 border border-teal-200/30 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {profile.isAdmin ? 'Son Cevaplanan Sorular (Admin)' : 'Son Sorularım'}
          </h3>

          {loadingQuestions ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-500">Sorular yükleniyor...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {profile.isAdmin 
                ? 'Henüz cevapladığınız soru yok.' 
                : 'Henüz soru sormadınız. Forum bölümünden soru sorabilirsiniz.'}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div 
                  key={q.id}
                  className={`p-4 rounded-2xl ${q.is_answered ? 'bg-teal-50' : 'bg-slate-50'}`}
                >
                  {!profile.isAdmin && q.users?.name && (
                    <div className="flex items-center gap-2 mb-2">
                      <AtSign className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold text-teal-700">{q.users.name}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="font-medium text-slate-900 flex-1">{q.question}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      q.is_answered 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {q.category}
                    </span>
                  </div>
                  {q.excerpt && (
                    <p className="text-sm text-slate-600 mb-2">{q.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    {q.is_answered ? (
                      <>
                        <Check className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-600 font-medium">Yanıtlandı</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-600 font-medium">Beklemede</span>
                      </>
                    )}
                    <span className="text-slate-500">• {formatTimeAgo(q.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Profilimi Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AtSign className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-teal-700">{profile.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                Üyelik: {profile.createdAt}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Adınız ve Soyadınız"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                if (!editName.trim()) {
                  toast.error('Lütfen adınızı girin');
                  return;
                }
                setIsSavingProfile(true);
                try {
                  const { error } = await supabase.auth.updateUser({
                    data: { name: editName }
                  });
                  
                  if (error) throw error;
                  
                  toast.success('Profil başarıyla güncellendi!');
                  setShowEditModal(false);
                  fetchProfile();
                } catch (error: any) {
                  toast.error('Profil güncellenirken hata: ' + error.message);
                } finally {
                  setIsSavingProfile(false);
                }
              }}
              disabled={isSavingProfile}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-2xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Şifremi Değiştir</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Mevcut Şifreniz"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Yeni Şifreniz"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Yeni Şifrenizi Onaylayın"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                // Validation
                if (!newPassword || !confirmPassword) {
                  toast.error('Lütfen tüm alanları doldurun');
                  return;
                }
                
                if (newPassword !== confirmPassword) {
                  toast.error('Yeni şifreler eşleşmiyor');
                  return;
                }
                
                if (newPassword.length < 6) {
                  toast.error('Şifre en az 6 karakter olmalıdır');
                  return;
                }
                
                setIsChangingPassword(true);
                try {
                  const { error } = await supabase.auth.updateUser({
                    password: newPassword
                  });
                  
                  if (error) throw error;
                  
                  toast.success('Şifreniz başarıyla güncellendi!');
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                } catch (error: any) {
                  toast.error('Şifre güncellenirken hata: ' + error.message);
                } finally {
                  setIsChangingPassword(false);
                }
              }}
              disabled={isChangingPassword}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-2xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Değiştiriliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Şifreyi Değiştir
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}