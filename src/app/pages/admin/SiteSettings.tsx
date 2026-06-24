import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Settings, Save, Globe, Mail, Home, User, FileText, Shield, Search, Loader2,
  Menu as MenuIcon, LayoutGrid, HelpCircle, Plus, Trash2, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSiteSettingsStore } from '../../store/siteSettingsStore';
import { DEFAULT_CONTENT } from '../../lib/defaultContent';
import { toast } from 'sonner';
import RichTextEditor from '../../components/RichTextEditor';

// ---- Nesne yolu yardımcıları (örn. "home.heroTitle") ----
const getPath = (obj: any, path: string) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const setPath = (obj: any, path: string, val: any) => {
  const keys = path.split('.');
  const clone = structuredClone(obj);
  let o = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = val;
  return clone;
};

type FieldType = 'text' | 'textarea' | 'rich';
interface Field {
  path: string;
  label: string;
  type?: FieldType;
}

// ---- Sekme tanımları ----
const TABS = [
  { id: 'general', label: 'Genel', icon: Settings },
  { id: 'nav', label: 'Menü', icon: MenuIcon },
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'contact', label: 'İletişim', icon: Mail },
  { id: 'social', label: 'Sosyal Medya', icon: Globe },
  { id: 'footer', label: 'Footer', icon: FileText },
  { id: 'about', label: 'Hakkımda', icon: User },
  { id: 'faq', label: 'SSS', icon: HelpCircle },
  { id: 'legal', label: 'Yasal', icon: Shield },
  { id: 'seo', label: 'SEO', icon: Search },
] as const;

const FIELDS: Record<string, Field[]> = {
  general: [
    { path: 'siteName', label: 'Site Adı' },
    { path: 'siteTagline', label: 'Site Sloganı' },
    { path: 'logoText', label: 'Logo Metni' },
  ],
  nav: [
    { path: 'nav.videos', label: 'Menü: Video Arşivi' },
    { path: 'nav.blog', label: 'Menü: Blog' },
    { path: 'nav.forum', label: 'Menü: Forum' },
    { path: 'nav.glossary', label: 'Menü: Sözlük' },
    { path: 'nav.about', label: 'Menü: Hakkımızda' },
    { path: 'nav.faq', label: 'Menü: SSS' },
    { path: 'nav.contact', label: 'Menü: İletişim' },
    { path: 'nav.loginButton', label: 'Buton: Giriş / Kayıt' },
    { path: 'nav.adminButton', label: 'Buton: Admin' },
    { path: 'nav.profileButton', label: 'Buton: Profilim' },
    { path: 'nav.logoutButton', label: 'Buton: Çıkış Yap' },
  ],
  home: [
    { path: 'home.badge', label: 'Hero — Üst Rozet' },
    { path: 'home.title', label: 'Hero — Büyük Başlık' },
    { path: 'home.subtitlePrefix', label: 'Hero — Alt Başlık (başı)' },
    { path: 'home.subtitleHighlight', label: 'Hero — Alt Başlık (vurgulu kelime)' },
    { path: 'home.subtitleSuffix', label: 'Hero — Alt Başlık (sonu)' },
    { path: 'home.ctaVideos', label: 'Hero — 1. Buton (Video)' },
    { path: 'home.ctaGlossary', label: 'Hero — 2. Buton (Sözlük)' },
    { path: 'home.scrollText', label: 'Hero — Kaydır Metni' },
    { path: 'home.forumBadge', label: 'Forum — Rozet' },
    { path: 'home.forumTitle', label: 'Forum — Başlık' },
    { path: 'home.forumDesc', label: 'Forum — Açıklama', type: 'textarea' },
    { path: 'home.forumCta', label: 'Forum — Buton' },
    { path: 'home.forumViewAll', label: 'Forum — Tümünü Gör Butonu' },
    { path: 'home.featuresTitle', label: 'Özellikler — Başlık' },
    { path: 'home.featuresDesc', label: 'Özellikler — Açıklama', type: 'textarea' },
    { path: 'home.cardVideoBadge', label: 'Kart: Video — Rozet' },
    { path: 'home.cardVideoTitle', label: 'Kart: Video — Başlık' },
    { path: 'home.cardVideoDesc', label: 'Kart: Video — Açıklama', type: 'textarea' },
    { path: 'home.cardVideoCta', label: 'Kart: Video — Buton' },
    { path: 'home.cardGlossaryTitle', label: 'Kart: Sözlük — Başlık' },
    { path: 'home.cardGlossaryDesc', label: 'Kart: Sözlük — Açıklama' },
    { path: 'home.cardAskTitle', label: 'Kart: Soru Sor — Başlık' },
    { path: 'home.cardAskDesc', label: 'Kart: Soru Sor — Açıklama' },
    { path: 'home.cardBlogTitle', label: 'Kart: Blog — Başlık' },
    { path: 'home.cardBlogDesc', label: 'Kart: Blog — Açıklama' },
    { path: 'home.cardAccountTitle', label: 'Kart: Hesap — Başlık' },
    { path: 'home.cardAccountDesc', label: 'Kart: Hesap — Açıklama' },
    { path: 'home.cardAccountCta', label: 'Kart: Hesap — Buton' },
    { path: 'home.whyBadge', label: 'Neden Biz — Rozet' },
    { path: 'home.whyTitleLine1', label: 'Neden Biz — Başlık 1. satır' },
    { path: 'home.whyTitleHighlight', label: 'Neden Biz — Başlık (vurgulu)' },
    { path: 'home.whyDesc', label: 'Neden Biz — Açıklama', type: 'textarea' },
    { path: 'home.whyCardName', label: 'Neden Biz — Kart İsim' },
    { path: 'home.whyCardRole', label: 'Neden Biz — Kart Ünvan' },
    { path: 'home.ctaTitle', label: 'Alt CTA — Başlık', type: 'textarea' },
    { path: 'home.ctaDesc', label: 'Alt CTA — Açıklama', type: 'textarea' },
    { path: 'home.ctaPrimary', label: 'Alt CTA — 1. Buton' },
    { path: 'home.ctaSecondary', label: 'Alt CTA — 2. Buton' },
    { path: 'home.disclaimer', label: 'Sayfa Sonu Uyarı (Disclaimer)', type: 'textarea' },
    { path: 'home.aboutTitle', label: 'Hakkımızda — Başlık' },
    { path: 'home.aboutText', label: 'Hakkımızda — Metin', type: 'textarea' },
    { path: 'home.aboutCta', label: 'Hakkımızda — Buton' },
    { path: 'home.glossaryTitle', label: 'Sözlük Bölümü — Başlık' },
    { path: 'home.glossaryDesc', label: 'Sözlük Bölümü — Açıklama', type: 'textarea' },
    { path: 'home.glossaryCta', label: 'Sözlük Bölümü — Buton' },
    { path: 'home.mythsTitle', label: 'Doğru Bilinen Yanlışlar — Başlık' },
    { path: 'home.mythsDesc', label: 'Doğru Bilinen Yanlışlar — Açıklama', type: 'textarea' },
    { path: 'home.socialTitle', label: 'Sosyal Medya — Başlık' },
    { path: 'home.socialDesc', label: 'Sosyal Medya — Açıklama', type: 'textarea' },
  ],
  contact: [
    { path: 'email', label: 'E-posta Adresi' },
    { path: 'phone', label: 'Telefon' },
    { path: 'contact.badge', label: 'Üst Rozet' },
    { path: 'contact.title', label: 'Başlık' },
    { path: 'contact.subtitle', label: 'Alt Başlık', type: 'textarea' },
    { path: 'contact.emailCardTitle', label: 'E-posta Kartı — Başlık' },
    { path: 'contact.emailCardDesc', label: 'E-posta Kartı — Açıklama' },
    { path: 'contact.phoneCardTitle', label: 'Telefon Kartı — Başlık' },
    { path: 'contact.phoneCardDesc', label: 'Telefon Kartı — Açıklama' },
    { path: 'contact.addressCardTitle', label: 'Adres Kartı — Başlık' },
    { path: 'contact.addressText', label: 'Adres (her satır yeni satır)', type: 'textarea' },
    { path: 'contact.hoursTitle', label: 'Çalışma Saatleri — Başlık' },
    { path: 'contact.hoursWeekdayLabel', label: 'Saat: Hafta içi etiketi' },
    { path: 'contact.hoursWeekdayValue', label: 'Saat: Hafta içi değeri' },
    { path: 'contact.hoursSatLabel', label: 'Saat: Cumartesi etiketi' },
    { path: 'contact.hoursSatValue', label: 'Saat: Cumartesi değeri' },
    { path: 'contact.hoursSunLabel', label: 'Saat: Pazar etiketi' },
    { path: 'contact.hoursSunValue', label: 'Saat: Pazar değeri' },
    { path: 'contact.formTitle', label: 'Form — Başlık' },
    { path: 'contact.formNameLabel', label: 'Form — Ad alanı etiketi' },
    { path: 'contact.formEmailLabel', label: 'Form — E-posta alanı etiketi' },
    { path: 'contact.formSubjectLabel', label: 'Form — Konu alanı etiketi' },
    { path: 'contact.formMessageLabel', label: 'Form — Mesaj alanı etiketi' },
    { path: 'contact.formButton', label: 'Form — Gönder Butonu' },
    { path: 'contact.note', label: 'Form altı not', type: 'textarea' },
    { path: 'contact.successToast', label: 'Gönderim sonrası mesaj' },
  ],
  social: [
    { path: 'instagram', label: 'Instagram (tam URL)' },
    { path: 'youtube', label: 'YouTube (tam URL)' },
    { path: 'linkedin', label: 'LinkedIn (tam URL)' },
    { path: 'facebook', label: 'Facebook (tam URL)' },
    { path: 'twitter', label: 'Twitter / X (tam URL)' },
  ],
  footer: [
    { path: 'footerAbout', label: 'Footer Hakkında', type: 'textarea' },
    { path: 'footerDisclaimer', label: 'Sorumluluk Reddi', type: 'textarea' },
    { path: 'footerCopyright', label: 'Telif (Copyright) Metni' },
    { path: 'footer.quickLinksTitle', label: 'Bölüm Başlığı: Hızlı Erişim' },
    { path: 'footer.infoTitle', label: 'Bölüm Başlığı: Bilgi' },
    { path: 'footer.followTitle', label: 'Bölüm Başlığı: Takip Edin' },
  ],
  about: [
    { path: 'aboutTitle', label: 'Başlık' },
    { path: 'aboutContent', label: 'İçerik', type: 'rich' },
  ],
  faq: [
    { path: 'faq.badge', label: 'Üst Rozet' },
    { path: 'faq.title', label: 'Başlık' },
    { path: 'faq.subtitle', label: 'Alt Başlık', type: 'textarea' },
    { path: 'faq.searchPlaceholder', label: 'Arama kutusu metni' },
    { path: 'faq.notFound', label: 'Sonuç bulunamadı metni' },
    { path: 'faq.notFoundHint', label: 'Sonuç bulunamadı alt metni' },
    { path: 'faq.helpTitle', label: 'Yardım kutusu — Başlık' },
    { path: 'faq.helpDesc', label: 'Yardım kutusu — Açıklama', type: 'textarea' },
    { path: 'faq.helpCta1', label: 'Yardım — 1. Buton' },
    { path: 'faq.helpCta2', label: 'Yardım — 2. Buton' },
  ],
  legal: [
    { path: 'privacyPolicy', label: 'Gizlilik Politikası', type: 'rich' },
    { path: 'termsOfService', label: 'Kullanım Koşulları', type: 'rich' },
  ],
  seo: [
    { path: 'metaDescription', label: 'Meta Açıklama', type: 'textarea' },
    { path: 'metaKeywords', label: 'Meta Anahtar Kelimeler (virgülle)' },
  ],
};

export default function SiteSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { settings, isLoading, fetchSettings, updateSettings } = useSiteSettingsStore();

  const [formData, setFormData] = useState<any>(DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/giris');
      return;
    }
    fetchSettings();
  }, [isAdmin, navigate, fetchSettings]);

  useEffect(() => {
    if (settings) setFormData(structuredClone(settings));
  }, [settings]);

  const update = (path: string, value: any) => setFormData((prev: any) => setPath(prev, path, value));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Site ayarları kaydedildi! 🎉');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return null;

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none';

  const renderField = (f: Field) => {
    const value = getPath(formData, f.path) ?? '';
    return (
      <div key={f.path}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {f.label}
        </label>
        {f.type === 'rich' ? (
          <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <RichTextEditor value={value} onChange={(v) => update(f.path, v)} />
          </div>
        ) : f.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => update(f.path, e.target.value)}
            rows={3}
            className={inputCls}
          />
        ) : (
          <input type="text" value={value} onChange={(e) => update(f.path, e.target.value)} className={inputCls} />
        )}
      </div>
    );
  };

  // Ana Sayfa istatistik dizisi editörü
  const stats: any[] = getPath(formData, 'home.stats') || [];
  const updateStat = (i: number, key: 'number' | 'label', val: string) => {
    const next = structuredClone(stats);
    next[i] = { ...next[i], [key]: val };
    update('home.stats', next);
  };

  // "Neden Biz" madde listesi editörü
  const whyItems: string[] = getPath(formData, 'home.whyItems') || [];
  const updateWhyItem = (i: number, val: string) => {
    const next = [...whyItems];
    next[i] = val;
    update('home.whyItems', next);
  };
  const addWhyItem = () => update('home.whyItems', [...whyItems, '']);
  const removeWhyItem = (i: number) => update('home.whyItems', whyItems.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 mb-2 inline-block">
            ← Admin Panel
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Site Ayarları
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sitenizin metinlerini buradan düzenleyebilirsiniz. Boş bırakılan alanlar varsayılan haliyle gösterilir.
          </p>
        </div>

        {isLoading && !settings ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/10 dark:border-slate-700 shadow-sm sticky top-24">
                <nav className="space-y-1">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/10 dark:border-slate-700 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>

                {/* SSS sekmesi: soruların dinamik yönetimi için yönlendirme */}
                {activeTab === 'faq' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Soruların kendisini (soru-cevap) ayrı panelden ekleyip düzenleyebilirsiniz.
                      Aşağıdaki alanlar sayfanın başlık/çerçeve metinleridir.
                    </p>
                    <Link
                      to="/admin/sss"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Soruları Yönet
                    </Link>
                  </div>
                )}

                {(FIELDS[activeTab] || []).map(renderField)}

                {/* Ana Sayfa özel editörler */}
                {activeTab === 'home' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-blue-600" /> İstatistik Barı (4 kutu)
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-2">
                            <input
                              type="text"
                              value={stat?.number ?? ''}
                              onChange={(e) => updateStat(i, 'number', e.target.value)}
                              className={inputCls}
                              placeholder="örn. 150+"
                            />
                            <input
                              type="text"
                              value={stat?.label ?? ''}
                              onChange={(e) => updateStat(i, 'label', e.target.value)}
                              className={inputCls}
                              placeholder="örn. Bilgilendirme Videosu"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        "Neden Omurgam?" Maddeleri
                      </h3>
                      <div className="space-y-2">
                        {whyItems.map((item, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateWhyItem(i, e.target.value)}
                              className={inputCls}
                            />
                            <button
                              type="button"
                              onClick={() => removeWhyItem(i)}
                              className="px-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addWhyItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-bold"
                        >
                          <Plus className="w-4 h-4" /> Madde Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
