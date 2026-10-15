import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import { contactAPI } from '../lib/api';
import Seo from '../components/Seo';
import { getConsent, subscribeConsent, setConsent, openCookiePreferences } from '../lib/consent';

// Harita araması için sade adres: paneldeki uzun adres metni ("… Banko Burger Üstü …") Google'da işletme kartı açıyor.
// Adres değişirse burayı da güncelle.
const MAP_QUERY = 'Ethemefendi Cad. No:3, Caddebostan, 34728 Kadıköy/İstanbul';
const MAP_Q = encodeURIComponent(MAP_QUERY);

export default function Contact() {
  const settings = useSiteSettingsStore((s) => s.settings);
  const t = settings.contact;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Google Haritalar gömülü medya izniyle yüklenir (YouTube ile aynı çerez kategorisi).
  const [mapAllowed, setMapAllowed] = useState<boolean>(() => !!getConsent()?.media);
  useEffect(() => subscribeConsent((c) => setMapAllowed(!!c?.media)), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactAPI.send(formData);
      trackEvent('contact_submit');
      toast.success(t.successToast);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('İletişim formu hatası:', error);
      toast.error(error.message || 'Mesaj gönderilemedi, lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const telHref = `tel:${(settings.phone || '').replace(/[^+\d]/g, '')}`;

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <Seo title={t.title || 'İletişim'} description={t.subtitle} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.emailCardTitle}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                {t.emailCardDesc}
              </p>
              <a
                href={`mailto:${settings.email}`}
                className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                {settings.email}
              </a>
            </div>

            {/* Telefon */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.phoneCardTitle}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                {t.phoneCardDesc}
              </p>
              <a
                href={telHref}
                className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                {settings.phone}
              </a>
            </div>

            {/* Adres */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/10 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.addressCardTitle}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">
                {t.addressText}
              </p>
            </div>

            {/* Çalışma Saatleri */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6" />
                <h3 className="text-lg font-semibold">{t.hoursTitle}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-100">{t.hoursWeekdayLabel}</span>
                  <span className="font-medium">{t.hoursWeekdayValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">{t.hoursSatLabel}</span>
                  <span className="font-medium">{t.hoursSatValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">{t.hoursSunLabel}</span>
                  <span className="font-medium">{t.hoursSunValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {t.formTitle}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t.formNameLabel}
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
                      {t.formEmailLabel}
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
                    {t.formSubjectLabel}
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
                    {t.formMessageLabel}
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
                      <span>{t.formButton}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bilgilendirme */}
              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">
                  <strong>Not:</strong> {t.note}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="mt-12">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/10 dark:border-slate-700 shadow-sm overflow-hidden">
            {mapAllowed ? (
              <iframe
                className="w-full h-80 sm:h-[28rem] rounded-xl border-0"
                src={`https://maps.google.com/maps?q=${MAP_Q}&z=17&hl=tr&output=embed`}
                title="Omurgam adresi Google Haritalar'da"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="min-h-80 sm:min-h-[28rem] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center p-6">
                <div className="text-center max-w-xl">
                  <MapPin className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium whitespace-pre-line">
                    {t.addressText}
                  </p>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Haritayı göstermek için Google Haritalar yüklenir; Google bu sırada çerez kullanabilir.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setConsent({ analytics: !!getConsent()?.analytics, media: true, marketing: !!getConsent()?.marketing })}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold hover:shadow-lg transition-all"
                    >
                      Haritayı Göster
                    </button>
                    <button
                      type="button"
                      onClick={openCookiePreferences}
                      className="px-5 py-2.5 rounded-xl border border-slate-400/60 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-white/40 transition-colors"
                    >
                      Çerez Tercihleri
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_Q}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-orange-600 transition-colors dark:bg-orange-600"
              >
                <Navigation className="w-4 h-4" aria-hidden="true" /> Yol tarifi al
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_Q}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" /> Google Haritalar'da aç
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
