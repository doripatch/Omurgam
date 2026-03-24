import { FileText, AlertTriangle, CheckCircle, UserCheck, Scale, Ban } from 'lucide-react';

export default function Terms() {
  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            <span>Kullanım Şartları</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Son Güncelleme: 21 Mart 2026
          </p>
        </div>

        {/* İçerik */}
        <div className="space-y-8">
          {/* Önemli Uyarı */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-3">Önemli Tıbbi Uyarı</h2>
                <p className="leading-relaxed mb-3">
                  Bu platform tamamen <strong>bilgilendirme amaçlıdır</strong>. Platform üzerinde paylaşılan 
                  hiçbir içerik, tıbbi tanı, tedavi veya öneri niteliği taşımaz.
                </p>
                <p className="leading-relaxed mb-3">
                  Herhangi bir sağlık probleminiz varsa, mutlaka lisanslı bir sağlık uzmanına danışınız. 
                  Platform üzerindeki bilgiler profesyonel tıbbi tavsiyenin yerine geçemez.
                </p>
                <p className="leading-relaxed font-semibold">
                  Acil durumlarda 112 Acil Sağlık Hizmetlerini arayınız.
                </p>
              </div>
            </div>
          </div>

          {/* Kabul ve Onay */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Kabul ve Onay
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Omurgam platformunu kullanarak, bu kullanım koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi 
              beyan edersiniz. Bu koşulları kabul etmiyorsanız, platformu kullanmamalısınız.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Platform üyeliği 18 yaş ve üzeri kişilere açıktır. 18 yaşından küçük kullanıcıların 
              veli veya vasi izni ile kayıt olması gerekmektedir.
            </p>
          </div>

          {/* Platform Kullanımı */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                2. Platform Kullanımı
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  İzin Verilen Kullanımlar:
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bilgilendirme amaçlı içerikleri okumak ve izlemek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Omurga sağlığı hakkında genel sorular sormak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>MR terimlerinin açıklamalarını öğrenmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Eğitim videoları ve blog yazılarını takip etmek</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Yasaklı Davranışlar */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                3. Yasaklı Davranışlar
              </h2>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Aşağıdaki davranışlar kesinlikle yasaktır ve hesabınızın askıya alınmasına 
              veya silinmesine neden olabilir:
            </p>

            <ul className="space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Tıbbi tanı veya tedavi talebinde bulunmak</strong> - Bu platform tanı veya tedavi hizmeti sunmamaktadır</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Kişisel sağlık verilerini (MR, röntgen, tetkik sonuçları) paylaşmak</strong> - Kişisel tıbbi belgeler paylaşılmamalıdır</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Yanıltıcı veya yanlış tıbbi bilgi paylaşmak</strong></span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Spam, reklam veya ticari içerik paylaşmak</strong></span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Küfür, hakaret veya saldırgan içerik paylaşmak</strong></span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Başka kullanıcıların kişisel bilgilerini paylaşmak</strong></span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-red-600 dark:text-red-400 font-bold mt-1">✕</span>
                <span><strong>Platform güvenliğini tehdit edecek davranışlarda bulunmak</strong></span>
              </li>
            </ul>
          </div>

          {/* İçerik Kullanımı */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. İçerik Kullanımı ve Telif Hakları
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Platform üzerindeki tüm içerikler (videolar, blog yazıları, görseller, metinler) 
              telif haklarıyla korunmaktadır ve Prof. Dr. Defne Kaya Utlu'ya aittir.
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>İçerikleri kişisel kullanım amacıyla görüntüleyebilirsiniz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>İçerikleri izinsiz kopyalayamaz, çoğaltamaz veya dağıtamazsınız</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Kaynak göstererek paylaşım yapabilirsiniz (sosyal medya linkleri vb.)</span>
              </li>
            </ul>
          </div>

          {/* Kullanıcı İçeriği */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Kullanıcı Tarafından Oluşturulan İçerik
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Platform üzerinde soru sorduğunuzda veya yorum yaptığınızda:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>İçeriğinizin platformda yayınlanması için izin vermiş olursunuz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>İçeriğinizin yasal, etik ve uygun olduğunu garanti edersiniz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Uygunsuz içerikleri yayından kaldırma hakkımız saklıdır</span>
              </li>
            </ul>
          </div>

          {/* Sorumluluk Reddi */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Sorumluluk Reddi
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Platform "olduğu gibi" sunulmaktadır. Aşağıdaki konularda sorumluluk kabul etmiyoruz:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span>Platform bilgilerine dayanarak alınan kararlar ve sonuçları</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span>Platform kesintileri veya teknik hatalar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span>Kullanıcılar tarafından paylaşılan yanlış bilgiler</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span>Üçüncü taraf web sitelerinin içeriği</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Hesap Güvenliği */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Hesap Güvenliği
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Hesabınızın güvenliği sizin sorumluluğunuzdadır:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span>Güçlü ve benzersiz bir şifre kullanın</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span>Şifrenizi başkalarıyla paylaşmayın</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span>Hesabınızdan şüpheli aktivite fark ederseniz hemen bize bildirin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span>Hesabınızdan yapılan tüm aktivitelerden siz sorumlusunuz</span>
              </li>
            </ul>
          </div>

          {/* Değişiklikler */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Koşullarda Değişiklik
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bu kullanım koşullarını istediğimiz zaman değiştirme hakkını saklı tutarız. 
              Önemli değişiklikler yapıldığında platform üzerinden veya e-posta ile bilgilendirme yapılacaktır. 
              Değişikliklerden sonra platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </div>

          {/* Uygulanacak Hukuk */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                9. Uygulanacak Hukuk
              </h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bu kullanım koşulları Türkiye Cumhuriyeti kanunlarına tabidir. 
              Platformdan kaynaklanan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Sorularınız mı var?</h2>
            </div>
            <p className="leading-relaxed mb-4">
              Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <a 
              href="/iletisim" 
              className="inline-block px-6 py-3 bg-white text-purple-600 font-medium rounded-xl hover:shadow-lg transition-all hover:scale-105"
            >
              İletişime Geç
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
