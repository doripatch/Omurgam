import { Shield, Lock, Eye, Database, FileText, CheckCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Gizlilik ve Güvenlik</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Son Güncelleme: 21 Mart 2026
          </p>
        </div>

        {/* İçerik */}
        <div className="space-y-8">
          {/* Giriş */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Giriş
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Omurgam platformu olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz. 
              Bu gizlilik politikası, platformumuzda toplanan bilgilerin nasıl kullanıldığını ve korunduğunu açıklar.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Platformumuzu kullanarak, bu gizlilik politikasında belirtilen uygulamaları kabul etmiş olursunuz.
            </p>
          </div>

          {/* Toplanan Bilgiler */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Toplanan Bilgiler
              </h2>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Kayıt Sırasında Toplanan Bilgiler
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Ad ve soyad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>E-posta adresi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Şifre (şifrelenmiş olarak saklanır)</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Kullanım Sırasında Toplanan Bilgiler
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Sorduğunuz sorular ve paylaştığınız içerikler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Platform kullanım verileri ve aktivite logları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>IP adresi ve cihaz bilgileri</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bilgilerin Kullanımı */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Bilgilerin Kullanımı
              </h2>
            </div>

            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Kullanıcı hesabınızı oluşturmak ve yönetmek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Platform hizmetlerini sağlamak ve iyileştirmek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Size özel içerik ve öneriler sunmak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Sizinle iletişim kurmak ve destek sağlamak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Platform güvenliğini sağlamak ve kötüye kullanımı önlemek</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Veri Güvenliği */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Veri Güvenliği
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Kişisel bilgilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>SSL/TLS şifreleme ile güvenli veri iletimi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Şifrelerin güvenli hash algoritmaları ile saklanması</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Düzenli güvenlik denetimleri ve güncellemeleri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Erişim kontrolü ve yetkilendirme mekanizmaları</span>
                </li>
              </ul>
            </div>
          </div>

          {/* KVKK Uyumu */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                KVKK Uyumu
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında haklarınız:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>İşlenmişse buna ilişkin bilgi talep etme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Kişisel verilerin düzeltilmesini veya silinmesini talep etme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Kişisel verilerin üçüncü kişilere aktarılıp aktarılmadığını öğrenme</span>
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                Bu haklarınızı kullanmak için <a href="/iletisim" className="text-amber-700 dark:text-amber-400 font-medium hover:underline">iletişim sayfamız</a> üzerinden bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>

          {/* Çerezler */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Çerezler (Cookies)
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezler, 
              cihazınızda saklanan küçük metin dosyalarıdır ve aşağıdaki amaçlarla kullanılır:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Oturum yönetimi ve kimlik doğrulama</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Kullanıcı tercihlerinin hatırlanması (örn: koyu mod tercihi)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Platform kullanımının analiz edilmesi</span>
              </li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu durumda 
              bazı platform özelliklerinin düzgün çalışmayabileceğini unutmayın.
            </p>
          </div>

          {/* Üçüncü Taraf Paylaşımı */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Üçüncü Taraf Paylaşımı
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz. Verileriniz yalnızca aşağıdaki 
              durumlarda paylaşılabilir:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Yasal zorunluluklar ve mahkeme kararları gereği</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Sizin açık onayınızla</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Platform hizmetlerini sağlamak için gerekli olan hizmet sağlayıcılarla (örn: hosting, e-posta servisleri)</span>
              </li>
            </ul>
          </div>

          {/* Değişiklikler */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Gizlilik Politikası Değişiklikleri
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olması 
              durumunda, platformda duyuru yapacağız veya e-posta ile bilgilendireceğiz. 
              Politikayı düzenli olarak gözden geçirmenizi öneririz.
            </p>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4">İletişim</h2>
            <p className="leading-relaxed mb-4">
              Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, 
              bizimle iletişime geçmekten çekinmeyin:
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@omurgam.com" className="hover:underline">info@omurgam.com</a>
              </p>
              <p>
                <strong>Veri Sorumlusu:</strong> Prof. Dr. Defne Kaya Utlu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
