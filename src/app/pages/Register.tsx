import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User, Eye, EyeOff, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    // Username validation
    if (formData.username.length < 3) {
      toast.error('Kullanıcı adı en az 3 karakter olmalıdır');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name);
      toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/giris');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Kayıt Ol</h1>
            <p className="text-slate-600">Omurgam Soruyor ailesine katılın</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <AtSign className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="ahmetyilmaz"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Sorularınız bu kullanıcı adıyla yayınlanacaktır. Sadece harf, rakam ve alt çizgi kullanabilirsiniz.
              </p>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Geçerli bir e-posta adresi girin (örn: kullanici@email.com)
              </p>
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="En az 6 karakter"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-slate-600">
                <a href="#" className="font-semibold text-teal-600 hover:text-teal-700">Kullanım Koşullarını</a> ve{' '}
                <a href="#" className="font-semibold text-teal-600 hover:text-teal-700">Gizlilik Politikasını</a> okudum, kabul ediyorum.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105"
            >
              {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-600">
                Zaten hesabınız var mı?{' '}
                <Link to="/giris" className="font-semibold text-teal-600 hover:text-teal-700">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}