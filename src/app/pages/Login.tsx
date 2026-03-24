import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

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