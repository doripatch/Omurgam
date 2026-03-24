import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateTestUser() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTestUser = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      // Sign up test user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@omurgam.com',
        password: 'test123456',
        options: {
          data: {
            name: 'Test Kullanıcı',
            role: 'user'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setResult({
            success: true,
            message: 'Test kullanıcısı zaten var! Giriş yapabilirsin.',
            email: 'test@omurgam.com',
            password: 'test123456',
            exists: true
          });
          toast.success('Test kullanıcısı zaten mevcut!');
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // Create user profile in database (using KV store simulation)
      // Since we don't have direct KV access from frontend, we'll just use Supabase auth
      
      setResult({
        success: true,
        message: 'Test kullanıcısı başarıyla oluşturuldu!',
        email: 'test@omurgam.com',
        password: 'test123456',
        userId: authData.user.id
      });

      toast.success('Test kullanıcısı oluşturuldu!');
    } catch (error: any) {
      console.error('Error creating test user:', error);
      setResult({
        success: false,
        error: error.message || 'Bilinmeyen hata'
      });
      toast.error(error.message || 'Kullanıcı oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Kullanıcısı Oluştur</h1>
            <p className="text-slate-600">Geliştirme ve test amaçlı kullanıcı hesabı</p>
          </div>

          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Test Kullanıcısı Bilgileri
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Email:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded">test@omurgam.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Şifre:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded">test123456</code>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Rol:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">Normal Kullanıcı (Admin Değil)</span>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={createTestUser}
              disabled={isCreating}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCreating ? 'Oluşturuluyor...' : 'Test Kullanıcısı Oluştur'}
            </button>

            {/* Result */}
            {result && (
              <div className={`border rounded-2xl p-6 ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.success ? 'Başarılı!' : 'Hata!'}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message || result.error}
                    </p>
                    
                    {result.success && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Giriş Bilgileri:</span>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <code className="text-slate-900">{result.email}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-500" />
                            <code className="text-slate-900">{result.password}</code>
                          </div>
                        </div>
                        
                        {!result.exists && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <a
                              href="/giris"
                              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
                            >
                              <span>Şimdi Giriş Yap</span>
                              <span>→</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Back Link */}
            <div className="text-center pt-4">
              <a
                href="/"
                className="text-slate-600 hover:text-slate-900 font-medium text-sm"
              >
                ← Ana Sayfaya Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
