import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simüle edilmiş form gönderimi
    setTimeout(() => {
      toast.success('Mesajınız alındı! En kısa sürede dönüş yapacağız.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            <span>Bize Ulaşın</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
            İletişim
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya görüşleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* İletişim Bilgileri */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">E-posta</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Bize e-posta gönderin
              </p>
              <a 
                href="mailto:info@omurgam.com" 
                className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                info@omurgam.com
              </a>
            </div>

            {/* Telefon */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Telefon</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Hafta içi 09:00 - 18:00
              </p>
              <a 
                href="tel:+902121234567" 
                className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                +90 (212) 123 45 67
              </a>
            </div>

            {/* Adres */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Adres</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                İstanbul Üniversitesi Tıp Fakültesi<br />
                Fiziksel Tıp ve Rehabilitasyon Ana Bilim Dalı<br />
                Fatih / İstanbul
              </p>
            </div>

            {/* Çalışma Saatleri */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Çalışma Saatleri</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-100">Pazartesi - Cuma</span>
                  <span className="font-medium">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">Cumartesi</span>
                  <span className="font-medium">09:00 - 13:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">Pazar</span>
                  <span className="font-medium">Kapalı</span>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Mesaj Gönderin
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Konu
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Mesajı Gönder</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bilgilendirme */}
              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Not:</strong> Mesajınız en geç 2 iş günü içerisinde yanıtlanacaktır. 
                  Acil durumlar için lütfen telefon ile iletişime geçiniz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="mt-12">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/10 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  İstanbul Üniversitesi Tıp Fakültesi
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Harita entegrasyonu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
