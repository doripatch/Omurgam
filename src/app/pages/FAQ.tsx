import { HelpCircle, Plus, Minus, Search, MessageCircle, Video, FileText, Stethoscope } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  icon: string;
}

const faqData: FAQItem[] = [
  // Genel Sorular
  {
    id: 1,
    category: 'Genel',
    icon: '❓',
    question: 'Omurgam platformu nedir ve nasıl kullanılır?',
    answer: 'Omurgam, Prof. Dr. Defne Kaya Utlu\'nun omurga sağlığı hakkında bilgilendirme amacıyla oluşturduğu bir platformdur. Platform üzerinde video arşivi, blog yazıları, MR terim sözlüğü ve soru-cevap forumu bulunmaktadır. Ücretsiz kayıt olarak içeriklere erişebilir, soru sorabilirsiniz.'
  },
  {
    id: 2,
    category: 'Genel',
    icon: '❓',
    question: 'Platform üyeliği ücretli mi?',
    answer: 'Hayır, platformumuza üyelik tamamen ücretsizdir. Tüm eğitim videoları, blog yazıları ve terim sözlüğüne ücretsiz olarak erişebilirsiniz. Amacımız omurga sağlığı hakkında bilgilendirme yapmaktır.'
  },
  {
    id: 3,
    category: 'Genel',
    icon: '❓',
    question: 'Platform mobil cihazlarda çalışıyor mu?',
    answer: 'Evet, platformumuz tüm cihazlarda (telefon, tablet, bilgisayar) sorunsuz çalışacak şekilde tasarlanmıştır. İster tarayıcıdan, isterseniz mobil cihazınızdan rahatlıkla erişebilirsiniz.'
  },
  // Tıbbi Bilgilendirme
  {
    id: 4,
    category: 'Tıbbi Bilgilendirme',
    icon: '🏥',
    question: 'Bu platformda tıbbi tanı veya tedavi alabilir miyim?',
    answer: 'Hayır. Bu platform tamamen bilgilendirme amaçlıdır. Tıbbi tanı, tetkik yorumlama veya tedavi önerisi yapılmaz. Sağlık probleminiz için mutlaka bir sağlık kuruluşuna başvurmalısınız.'
  },
  {
    id: 5,
    category: 'Tıbbi Bilgilendirme',
    icon: '🏥',
    question: 'MR sonucumu yükleyip yorumlatabilir miyim?',
    answer: 'Hayır. Kişisel sağlık verilerinizi (MR, röntgen, tetkik sonuçları) platformda paylaşmamalısınız. MR Terim Sözlüğü sadece raporlarda geçen terimlerin anlamlarını öğrenmenize yardımcı olur, rapor yorumu yapmaz.'
  },
  {
    id: 6,
    category: 'Tıbbi Bilgilendirme',
    icon: '🏥',
    question: 'Acil durumda ne yapmalıyım?',
    answer: 'Acil sağlık durumlarında kesinlikle 112 Acil Sağlık Hizmetlerini arayın veya en yakın hastane acil servisine başvurun. Platform acil tıbbi müdahale sağlamaz.'
  },
  // Soru-Cevap Forumu
  {
    id: 7,
    category: 'Forum',
    icon: '💬',
    question: 'Sorularıma kim cevap veriyor?',
    answer: 'Platformdaki sorulara Prof. Dr. Defne Kaya Utlu ve ekibi cevap vermektedir. Ancak bu yanıtlar bilgilendirme amaçlıdır ve kişisel tıbbi tavsiye niteliği taşımaz.'
  },
  {
    id: 8,
    category: 'Forum',
    icon: '💬',
    question: 'Soruma ne kadar sürede cevap gelir?',
    answer: 'Sorular genellikle 2-3 iş günü içinde yanıtlanmaktadır. Yoğunluk durumunda bu süre uzayabilir. Acil durumlar için mutlaka bir sağlık kuruluşuna başvurun.'
  },
  {
    id: 9,
    category: 'Forum',
    icon: '💬',
    question: 'Hangi konularda soru sorabilirim?',
    answer: 'Omurga sağlığı, bel fıtığı, boyun ağrısı, skolyoz, postür bozuklukları gibi genel bilgilendirme soruları sorabilirsiniz. Kişisel tanı, tedavi veya ilaç önerisi talep edilemez.'
  },
  {
    id: 10,
    category: 'Forum',
    icon: '💬',
    question: 'Sorularım başkaları tarafından görülebilir mi?',
    answer: 'Evet, platformdaki sorular ve cevaplar diğer kullanıcılar tarafından görülebilir. Bu sayede benzer sorunları olan kişiler de bilgilere ulaşabilir. Gizli kalmasını istediğiniz bilgileri paylaşmayın.'
  },
  // Video ve İçerikler
  {
    id: 11,
    category: 'İçerikler',
    icon: '🎥',
    question: 'Videoları indirebilir miyim?',
    answer: 'Hayır, telif hakları nedeniyle videoları indiremezsiniz. Ancak platform üzerinden istediğiniz zaman izleyebilirsiniz.'
  },
  {
    id: 12,
    category: 'İçerikler',
    icon: '🎥',
    question: 'Yeni içerikler ne sıklıkta ekleniyor?',
    answer: 'Her hafta yeni video ve blog içerikleri eklenmektedir. Güncellemelerden haberdar olmak için platformu düzenli olarak ziyaret edebilir veya bildirimlerinizi açabilirsiniz.'
  },
  {
    id: 13,
    category: 'İçerikler',
    icon: '🎥',
    question: 'İçerikleri sosyal medyada paylaşabilir miyim?',
    answer: 'Evet, içerik linklerini sosyal medyada kaynak göstererek paylaşabilirsiniz. Ancak videoları indirip yeniden yükleyemezsiniz.'
  },
  // Hesap ve Güvenlik
  {
    id: 14,
    category: 'Hesap',
    icon: '🔐',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz.'
  },
  {
    id: 15,
    category: 'Hesap',
    icon: '🔐',
    question: 'Hesabımı silebilir miyim?',
    answer: 'Evet, profil sayfanızdan hesabınızı silebilir veya bizimle iletişime geçerek hesabınızın silinmesini talep edebilirsiniz. Hesap silme işlemi geri alınamaz.'
  },
  {
    id: 16,
    category: 'Hesap',
    icon: '🔐',
    question: 'Kişisel bilgilerim güvende mi?',
    answer: 'Evet, tüm kişisel bilgileriniz SSL şifreleme ile korunmaktadır ve KVKK\'ya uygun olarak saklanmaktadır. Detaylı bilgi için Gizlilik Politikası sayfamızı inceleyebilirsiniz.'
  },
  // MR Terim Sözlüğü
  {
    id: 17,
    category: 'Terim Sözlüğü',
    icon: '📖',
    question: 'MR Terim Sözlüğü nedir?',
    answer: 'MR raporlarında geçen tıbbi terimlerin (herniation, stenosis, spondylosis vb.) Türkçe açıklamalarını bulabileceğiniz bir sözlüktür. Rapor yorumu değil, terim açıklaması yapar.'
  },
  {
    id: 18,
    category: 'Terim Sözlüğü',
    icon: '📖',
    question: 'Aradığım terimi bulamadım, ne yapmalıyım?',
    answer: 'Soru-cevap forumundan terimin ne anlama geldiğini sorabilirsiniz. Sık sorulan terimler sözlüğe düzenli olarak eklenmektedir.'
  }
];

const categories = ['Tümü', 'Genel', 'Tıbbi Bilgilendirme', 'Forum', 'İçerikler', 'Hesap', 'Terim Sözlüğü'];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const toggleQuestion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Genel': return HelpCircle;
      case 'Tıbbi Bilgilendirme': return Stethoscope;
      case 'Forum': return MessageCircle;
      case 'İçerikler': return Video;
      case 'Hesap': return FileText;
      case 'Terim Sözlüğü': return FileText;
      default: return HelpCircle;
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Sıkça Sorulan Sorular</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
            SSS
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Platform kullanımı ve omurga sağlığı hakkında merak ettikleriniz
          </p>
        </div>

        {/* Arama */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Kategoriler */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Liste */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const CategoryIcon = getCategoryIcon(faq.category);
              return (
                <div
                  key={faq.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full p-6 text-left flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
                        {faq.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CategoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          {openId === faq.id ? (
                            <Minus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Plus className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {openId === faq.id && (
                    <div className="px-6 pb-6 pl-20">
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Aradığınız soruyu bulamadık.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                Farklı bir arama terimi deneyin veya soru-cevap forumundan sorun.
              </p>
            </div>
          )}
        </div>

        {/* Yardım Bölümü */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Sorunuzu bulamadınız mı?</h2>
            <p className="mb-6 text-blue-100">
              Soru-cevap forumundan sorunuzu sorabilir veya bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/soru-sor"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                Soru Sor
              </a>
              <a
                href="/iletisim"
                className="px-6 py-3 bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-800 transition-all"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
