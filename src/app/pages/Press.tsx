import { Mail, Download, Newspaper, BadgeCheck } from 'lucide-react';
import Seo from '../components/Seo';

export default function Press() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo
        title="Basın Odası"
        description="Omurgam basın odası — Prof. Dr. Defne Kaya Utlu ve platform hakkında basın bilgileri, biyografi, logo ve iletişim."
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Newspaper className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Basın Odası</h1>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
          Röportaj talepleri, uzman görüşü ve görsel materyaller için:{' '}
          <a href="mailto:iletisim@omurgam.com" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline">
            iletisim@omurgam.com
          </a>{' '}
          — <strong>24 saat içinde</strong> dönüş yapıyoruz.
        </p>

        {/* Tek paragraf tanım */}
        <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Omurgam Hakkında (kopyalanabilir)</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Omurgam, Prof. Dr. Defne Kaya Utlu öncülüğünde hazırlanan, omurga sağlığı konusunda toplumun doğru ve
            bilimsel bilgiye erişmesini amaçlayan bağımsız bir dijital sağlık bilgi platformudur. Bel ve boyun ağrısı,
            bel fıtığı, skolyoz ve duruş bozuklukları gibi konularda; videolar, tıbbi terim sözlükleri, uzman yanıtları
            ve sadeleştirilmiş bilimsel içeriklerle Türkiye'nin en güvenilir omurga bilgi kaynağı olmayı hedefler.
          </p>
        </section>

        {/* Kurucu / uzman */}
        <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Kurucu & Uzman</h2>
          <div className="flex flex-col sm:flex-row gap-5">
            <img
              src="/assets/defne-hoca.jpg"
              alt="Prof. Dr. Defne Kaya Utlu"
              className="w-32 h-40 object-cover object-top rounded-xl flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-slate-900 dark:text-white">Prof. Dr. Defne Kaya Utlu</p>
                <BadgeCheck className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-sm text-teal-700 dark:text-teal-300 font-medium mb-2">
                Fizyoterapi Profesörü · Klinik Araştırmacı · DKU Akademi Kurucusu
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                27 yılı aşkın klinik ve akademik deneyim. 39 bilimsel yayın (Q1–Q2), Google Scholar h-index 28,
                2.350+ atıf, Springer dâhil 10+ kitap editörlüğü. Kas-iskelet ve omurga rehabilitasyonu,
                spor ve ortopedik rehabilitasyon, propriyosepsiyon alanlarında uzman.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Uzman görüşü / röportaj için müsaittir. Talep: iletisim@omurgam.com
              </p>
            </div>
          </div>
        </section>

        {/* Görsel materyaller */}
        <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Görsel Materyaller</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/assets/logo.png" download className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" /> Logo (sembol)
            </a>
            <a href="/assets/logo-og.png" download className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" /> Logo (tam)
            </a>
            <a href="/assets/defne-hoca.jpg" download className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" /> Prof. Dr. Defne Kaya Utlu fotoğrafı
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Logolar Omurgam'ın tescilli markasıdır; yalnızca Omurgam'a atıfla, değiştirilmeden kullanılabilir.
          </p>
        </section>

        {/* İletişim */}
        <section className="text-center">
          <a
            href="mailto:iletisim@omurgam.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:shadow-lg transition-all"
          >
            <Mail className="w-5 h-5" /> Basın İletişim: iletisim@omurgam.com
          </a>
        </section>
      </div>
    </div>
  );
}
