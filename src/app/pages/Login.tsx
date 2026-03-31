import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const signin = useAuthStore((state) => state.signin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);

    try {
      await signin(email, password);
      toast.success('Giriş başarılı!');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(`${provider} ile giriş yapılamadı: ${error.message}`);
      }
    } catch (error: any) {
      console.error(`❌ ${provider} login error:`, error);
      toast.error(`${provider} ile giriş sırasında hata oluştu`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-700 to-orange-700 rounded-[3rem] p-12 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl font-bold mb-4">
                Omurgam'a<br />Hoş Geldiniz
              </h2>
              <p className="text-xl text-amber-100 mb-8">
                Prof. Dr. Defne Kaya Utlu ile omurga sağlığınız için 
                güvenilir bilgiler ve uzman yanıtlar
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">150+ Bilgilendirme Videosu</h4>
                    <p className="text-sm text-amber-100">Fizyoterapi profesöründen içerikler</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tıbbi Terim Sözlüğü</h4>
                    <p className="text-sm text-amber-100">MR raporu terimlerinin açıklamaları</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Soru-Cevap Forumu</h4>
                    <p className="text-sm text-amber-100">Sorularınızı paylaşın</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div>
          <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
              <p className="text-slate-600">Hesabınıza erişmek için giriş yapın</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-slate-600">Beni hatırla</span>
                </label>
                <a href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                  Şifremi Unuttum
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">veya</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google ile Devam Et
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1877F2] text-white font-semibold rounded-2xl hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook ile Devam Et
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoading}
                  className="w-full py-3 bg-black text-white font-semibold rounded-2xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple ile Devam Et
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 mt-4">
                ⚠️ <strong>Önemli:</strong> Google/Facebook/Apple ile giriş için Supabase ayarları yapılmalıdır.<br/>
                <a href="https://supabase.com/docs/guides/auth/social-login" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Kurulum Talimatları</a>
              </p>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-slate-600">
                  Hesabınız yok mu?{' '}
                  <Link to="/kayit" className="font-semibold text-teal-600 hover:text-teal-700">
                    Kayıt Ol
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-sm text-slate-600">
              Prof. Dr. Defne Kaya Utlu ile<br />
              Omurga Sağlığınız Güvende
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
