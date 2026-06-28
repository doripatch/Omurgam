import { GraduationCap, Award, Briefcase, Heart, BookOpen, Globe, Users, Trophy, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import Seo from '../components/Seo';

export default function About() {
  const { settings, isLoading } = useSiteSettingsStore();  // 

  if (isLoading) {  //
    return (
      <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <Seo
        title={`${settings?.aboutTitle || 'Prof. Dr. Defne Kaya Utlu'} — Hakkımda`}
        description="Prof. Dr. Defne Kaya Utlu — fizyoterapi profesörü. Akademik özgeçmiş, uluslararası deneyim, kitap editörlükleri ve çalışma alanları."
        type="profile"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Hakkımızda</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent mb-4">
  {settings?.aboutTitle || 'Prof. Dr. Defne Kaya Utlu'}
</h1>
<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
  {settings?.aboutContent?.replace(/<[^>]*>/g, '') || 'Fizyoterapi Profesörü'}
</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Biyografi */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Heart className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                Hakkımda
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  23 Aralık 1976 yılında Cide/Kastamonu'da doğdum. Hacettepe Üniversitesi Sağlık Bilimleri Fakültesi 
                  Fizik Tedavi ve Rehabilitasyon Bölümü'nü 1999'da bitirdim.
                </p>
                <p className="leading-relaxed">
                  Aynı yıl, Hacettepe Üniversitesi'nde lisansüstü eğitimine ve araştırma görevlisi olarak 
                  Erken Ortopedik Rehabilitasyon Ünitesi'nde çalışmaya başladım. 2002 yılında 
                  "Yüksek Voltaj Kesikli Galvanik Stimulasyon ve Patellar Bantlamanın Patellofemoral Ağrı 
                  Sendromu Üzerine Etkisi" konulu tezimle bilim uzmanlığını aldım.
                </p>
                <p className="leading-relaxed">
                  2008'de "Patellofemoral Ağrı Sendromunda Kas Kuvveti, Fonksiyonel Endurans, Koordinasyon ve 
                  Propriyosepsiyon" konulu tezimle doktoramı tamamladım.
                </p>
                <p className="leading-relaxed">
                  2013 yılında Doçent, 2018 yılında Profesör unvanı aldım. 30'u SCI'da taranan dergilerde 
                  yayımlanan çok sayıda uluslararası ve ulusal yayınım vardır.
                </p>
                <p className="leading-relaxed font-medium text-teal-700 dark:text-teal-400">
                  Hâlen Sağlık Bilimleri Üniversitesi Hamidiye Sağlık Bilimleri Fakültesi
                  Fizyoterapi ve Rehabilitasyon Bölümü'nde öğretim üyesiyim. Ayrıca SBÜ Teknopol İstanbul
                  bünyesinde DKU Akademi kapsamında sanayi–üniversite iş birlikleri yürütüyorum.
                </p>
              </div>
            </div>

            {/* Uluslararası Deneyim */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                Uluslararası Deneyim
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Manchester Üniversitesi - Center For Rehabilitation Science (2007)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Birleşik Krallık'ın onursal araştırıcısı olarak "Optimizing Physiotherapy in the Treatment 
                      of Patellofemoral Pain Syndrome" projesinde araştırmacı
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Münih Teknik Üniversitesi (2008)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Rotator kılıf ve medial patellofemoral ligament cerrahisi sonrası fizyoterapi
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Manchester Metropolitan Üniversitesi & Manchester City FC (2017)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Erasmus kapsamında eğitimci
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - İstatistikler ve Bilgiler */}
          <div className="space-y-6">
            {/* İstatistikler */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-6">Akademik Başarılar</h3>
              <p className="text-xs text-teal-100/80 mb-4 -mt-3">Nisan 2026 itibarıyla</p>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">39</div>
                  <div className="text-sm text-teal-100">Bilimsel Yayın (Q1–Q2)</div>
                </div>
                <div className="border-t border-teal-400/30 pt-4">
                  <div className="text-3xl font-bold">28</div>
                  <div className="text-sm text-teal-100">h-index (Google Scholar)</div>
                </div>
                <div className="border-t border-teal-400/30 pt-4">
                  <div className="text-3xl font-bold">2.350+</div>
                  <div className="text-sm text-teal-100">Toplam Atıf</div>
                </div>
                <div className="border-t border-teal-400/30 pt-4">
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm text-teal-100">Kitap Editörlüğü</div>
                </div>
              </div>
            </div>

            {/* Ödüller */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Ödüller
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      En İyi Sözel Sunum & Genç Araştırmacı Destek Ödülü
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      X. Türk Spor Yaralanmaları Kongresi, 2010
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Okunması Gereken 100 Makale
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Avustralya Spor Komisyonu, 2010
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mevcut Görev */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Mevcut Görev
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Sağlık Bilimleri Üniversitesi</strong><br />
                Hamidiye Sağlık Bilimleri Fakültesi<br />
                Fizyoterapi ve Rehabilitasyon Bölümü — Öğretim Üyesi<br />
                <span className="text-xs text-slate-500 dark:text-slate-400">DKU Akademi (SBÜ Teknopol İstanbul)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Akademik Yolculuk */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Akademik Yolculuk
          </h2>
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative pl-8 border-l-2 border-purple-200 dark:border-purple-800">
              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2022 - Halen</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Sağlık Bilimleri Üniversitesi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Hamidiye Sağlık Bilimleri Fakültesi, Fizyoterapi ve Rehabilitasyon Bölümü — Öğretim Üyesi
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2020 - 2022</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Bursa Uludağ Üniversitesi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sağlık Bilimleri Fakültesi Fizyoterapi Rehabilitasyon Kurucu Bölüm Başkanı
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2015 - 2020</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Üsküdar Üniversitesi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sağlık Bilimleri Fakültesi Fizyoterapi Rehabilitasyon Kurucu Bölüm Başkanı<br />
                  Dekan Yardımcısı (2016-2018)<br />
                  Girişimsel Olmayan Etik Kurul Üyesi (2017-2020)
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2018</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Profesörlük</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Profesör unvanı
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2013</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Doçentlik</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Doçent unvanı
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2009</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Hacettepe Üniversitesi Tıp Fakültesi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Spor Hekimliği Öğretim Görevlisi
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2008</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Doktora</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  "Patellofemoral Ağrı Sendromunda Kas Kuvveti, Fonksiyonel Endurans, Koordinasyon ve Propriyosepsiyon"
                </p>
              </div>

              <div className="mb-8">
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">2002</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Yüksek Lisans</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  "Yüksek Voltaj Kesikli Galvanik Stimulasyon ve Patellar Bantlamanın Patellofemoral Ağrı Sendromu Üzerine Etkisi"
                </p>
              </div>

              <div>
                <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">1999</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Hacettepe Üniversitesi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sağlık Bilimleri Fakültesi Fizik Tedavi ve Rehabilitasyon Bölümü
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kitap Editörlükleri */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Kitap Editörlükleri
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Functional Exercise Anatomy and Physiology for Physiotherapists
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Springer International Publishing, 2023 (572 sayfa)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Proprioception in Orthopaedics, Sports Medicine and Rehabilitation
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Springer International Publishing, 2018 (Baş Editör)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Fizyoterapistler İçin Egzersiz Anatomisi ve Fizyolojisi
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Hipokrat Yayınevi, 2021 (480 sayfa, Baş Editör)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Sık Yapılan Ortopedik Cerrahi Uygulamalar ve Rehabilitasyon Yaklaşımları
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    İstanbul Tıp Kitabevi, 2021 (616 sayfa)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Proprioception: The Forgotten Sixth Sense
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    OMICS Group eBooks, 2016 (Editör ve Yazar)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Sports Injuries - Prevention, Diagnosis, Treatment and Rehabilitation
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Springer Verlag, 2015 (Editör Yardımcısı, 3295 sayfa)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Kas ve Tendon Mimarisinin Temelleri ve Klinik Egzersiz Rehberi
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Hipokrat Yayınevi, 2025 (416 sayfa, Editör)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Uygulamalı PNF
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Hipokrat Yayınevi, 2023 (368 sayfa, Çeviri Baş Editörü)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Çalışma Alanları */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-green-600 dark:text-green-400" />
            Çalışma Alanları
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Omurga Sağlığı',
              'Bel ve Boyun Ağrı Rehabilitasyonu',
              'Kas-İskelet Sistemi Problemlerinde Rehabilitasyon',
              'Ortopedik ve Spor Rehabilitasyon',
              'Servikojenik Baş Ağrı Rehabilitasyonu',
              'Postür/Duruş Bozuklukları Analiz ve Rehabilitasyonu',
              'Ayak/Yürüyüş Bozuklukları Analiz ve Rehabilitasyonu',
              'Fonksiyonel/Klinik Egzersiz',
              'Manuel Terapi/Osteopatik Tedavi',
              'El Rehabilitasyonu',
              'Lenfödem Rehabilitasyonu',
              'Ağrı Rehabilitasyonu',
              'Uyku Rehabilitasyonu',
              'Obezite Rehabilitasyonu',
              'Ayak Analizi ve Tabanlık'
            ].map((alan, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {alan}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dergi Editörlükleri */}
        <div className="mt-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            Dergi Editörlükleri
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-purple-200 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold">Biomed Research International</p>
                <p className="text-sm text-purple-100">Akademik Editör, 2019-Halen (SCI)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-purple-200 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold">Muscle, Ligaments and Tendons Journal</p>
                <p className="text-sm text-purple-100">Editör Kurul Üyesi, 2015-2022 (E-SCI)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-purple-200 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold">Türk Fizyoterapi ve Rehabilitasyon Dergisi</p>
                <p className="text-sm text-purple-100">Editör Yardımcısı, 2013-2017 (TR-ULAKBİM)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ekip */}
        <div className="mt-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Users className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            Ekip
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Omurgam'ı hayata geçiren ekip.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                DK
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Prof. Dr. Defne Kaya Utlu</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Defne KAYA UTLU, Professor, PhD, PT</p>
                <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Kurucu &amp; Bilimsel Direktör</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Founder &amp; Scientific Director</p>
                <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Fizyoterapi Profesörü | Kas-iskelet ve Omurga Rehabilitasyonu</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Professor of Physiotherapy | Musculoskeletal &amp; Spine Rehabilitation</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                DS
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Fzt. Dorukhan Sayım</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Dorukhan SAYIM, PT</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Kurucu Ortak &amp; Teknoloji Direktörü</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Co-Founder &amp; CTO</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Fizyoterapist | Yazılım &amp; Ürün Geliştirme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Physiotherapist | Software &amp; Product Development</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
