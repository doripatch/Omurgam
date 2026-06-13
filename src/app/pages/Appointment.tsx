import { useState } from 'react';
import { CalendarCheck, User, Phone, Mail, FileText, Clock, Send, Info } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsAPI } from '../lib/api';
import Seo from '../components/Seo';

export default function Appointment() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    preferredDate: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Lütfen ad ve telefon alanlarını doldurun');
      return;
    }
    setIsSubmitting(true);
    try {
      await appointmentsAPI.send(formData);
      toast.success('Talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.');
      setFormData({ name: '', phone: '', email: '', subject: '', preferredDate: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Talep gönderilemedi, lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all';

  return (
    <div className="w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-16 px-4">
      <Seo
        title="Randevu / Danışma Talebi"
        description="Prof. Dr. Defne Kaya Utlu'dan omurga ve fizyoterapi konularında danışma/randevu talebinde bulunun. Talebinizi bırakın, sizinle iletişime geçelim."
      />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
            <CalendarCheck className="w-4 h-4" />
            <span>Randevu / Danışma</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
            Randevu Talebi Oluşturun
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Aşağıdaki formu doldurun, ekibimiz en kısa sürede sizinle iletişime geçerek uygun zamanı planlasın.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ad Soyad *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} placeholder="Adınız Soyadınız" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Telefon *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputCls} placeholder="05XX XXX XX XX" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-posta (opsiyonel)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="ornek@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tercih Edilen Zaman (opsiyonel)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className={inputCls} placeholder="örn. Hafta içi öğleden sonra" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Konu</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className={inputCls} placeholder="örn. Bel ağrısı, postür değerlendirmesi" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mesajınız (opsiyonel)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                placeholder="Durumunuz hakkında kısa bilgi verebilirsiniz..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Talep Gönder</span>
                </>
              )}
            </button>
          </form>

          {/* Bilgilendirme */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Bu form bir <strong>talep</strong> oluşturur, kesin randevu anlamına gelmez. Ekibimiz sizinle iletişime
              geçerek uygun zamanı planlayacaktır. Acil sağlık durumlarında lütfen 112'yi arayın veya en yakın sağlık
              kuruluşuna başvurun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
