import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Settings, Save, Globe, Mail, Phone, MapPin, 
  Instagram, Youtube, Linkedin, Facebook, Twitter,
  Home, User, FileText, Shield, Search, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSiteSettingsStore } from '../../store/siteSettingsStore';
import { toast } from 'sonner';
import RichTextEditor from '../../components/RichTextEditor';

export default function SiteSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { settings, isLoading, fetchSettings, updateSettings } = useSiteSettingsStore();
  
  const [formData, setFormData] = useState({
    // Genel
    siteName: '',
    siteTagline: '',
    logoText: '',
    // İletişim
    email: '',
    phone: '',
    address: '',
    // Sosyal Medya
    instagram: '',
    youtube: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    // Ana Sayfa
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    // Hakkımda
    aboutTitle: '',
    aboutContent: '',
    // Footer
    footerAbout: '',
    footerDisclaimer: '',
    footerCopyright: '',
    // Yasal
    privacyPolicy: '',
    termsOfService: '',
    // SEO
    metaDescription: '',
    metaKeywords: '',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'home' | 'about' | 'footer' | 'legal' | 'seo'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/giris');
      return;
    }
    fetchSettings();
  }, [isAdmin, navigate, fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData(settings as any);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  if (!isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'contact', label: 'İletişim', icon: Mail },
    { id: 'social', label: 'Sosyal Medya', icon: Globe },
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'about', label: 'Hakkımda', icon: User },
    { id: 'footer', label: 'Footer', icon: FileText },
    { id: 'legal', label: 'Yasal', icon: Shield },
    { id: 'seo', label: 'SEO', icon: Search },
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Site Ayarları
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sitenizin tüm içeriklerini buradan düzenleyebilirsiniz
          </p>
        </div>

        {isLoading && !settings ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/10 dark:border-slate-700 shadow-sm sticky top-24">
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
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

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/10 dark:border-slate-700 shadow-sm">
                
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Genel Ayarlar</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Site Adı
                      </label>
                      <input
                        type="text"
                        value={formData.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Omurgam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Site Sloganı
                      </label>
                      <input
                        type="text"
                        value={formData.siteTagline}
                        onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Prof. Dr. Defne Kaya Utlu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Logo Metni
                      </label>
                      <input
                        type="text"
                        value={formData.logoText}
                        onChange={(e) => handleInputChange('logoText', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Omurgam"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">İletişim Bilgileri</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="info@omurgam.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="+90 (212) 123 45 67"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Adres
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="İstanbul, Türkiye"
                      />
                    </div>
                  </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Sosyal Medya Linkleri</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Instagram className="w-4 h-4 inline mr-2" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://www.instagram.com/omurgam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Youtube className="w-4 h-4 inline mr-2" />
                        YouTube
                      </label>
                      <input
                        type="url"
                        value={formData.youtube}
                        onChange={(e) => handleInputChange('youtube', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://www.youtube.com/@omurgam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Linkedin className="w-4 h-4 inline mr-2" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://www.linkedin.com/in/omurgam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Facebook className="w-4 h-4 inline mr-2" />
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://www.facebook.com/omurgam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Twitter className="w-4 h-4 inline mr-2" />
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://twitter.com/omurgam"
                      />
                    </div>
                  </div>
                )}

                {/* Home Page Tab */}
                {activeTab === 'home' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Ana Sayfa İçeriği</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Hero Başlık
                      </label>
                      <input
                        type="text"
                        value={formData.heroTitle}
                        onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Omurga Sağlığınız İçin Bilimsel Rehber"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Hero Alt Başlık
                      </label>
                      <input
                        type="text"
                        value={formData.heroSubtitle}
                        onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Prof. Dr. Defne Kaya Utlu ile Omurga Sağlığı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Hero Açıklama
                      </label>
                      <textarea
                        value={formData.heroDescription}
                        onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Bilimsel bilgi ve eğitici içeriklerle omurga sağlığınızı koruyun"
                      />
                    </div>
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Hakkımda Sayfası</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={formData.aboutTitle}
                        onChange={(e) => handleInputChange('aboutTitle', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Prof. Dr. Defne Kaya Utlu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        İçerik (HTML Destekli)
                      </label>
                      <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                        <RichTextEditor
                          value={formData.aboutContent}
                          onChange={(value) => handleInputChange('aboutContent', value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Tab */}
                {activeTab === 'footer' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Footer Ayarları</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Footer Hakkında
                      </label>
                      <textarea
                        value={formData.footerAbout}
                        onChange={(e) => handleInputChange('footerAbout', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Sorumluluk Reddi
                      </label>
                      <textarea
                        value={formData.footerDisclaimer}
                        onChange={(e) => handleInputChange('footerDisclaimer', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Copyright Metni
                      </label>
                      <input
                        type="text"
                        value={formData.footerCopyright}
                        onChange={(e) => handleInputChange('footerCopyright', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Legal Tab */}
                {activeTab === 'legal' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Yasal Sayfalar</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gizlilik Politikası (HTML Destekli)
                      </label>
                      <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                        <RichTextEditor
                          value={formData.privacyPolicy}
                          onChange={(value) => handleInputChange('privacyPolicy', value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Kullanım Koşulları (HTML Destekli)
                      </label>
                      <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                        <RichTextEditor
                          value={formData.termsOfService}
                          onChange={(value) => handleInputChange('termsOfService', value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">SEO Ayarları</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Meta Açıklama
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        rows={3}
                        maxLength={160}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Omurga sağlığı hakkında bilimsel bilgiler..."
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {formData.metaDescription.length}/160 karakter
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Meta Anahtar Kelimeler
                      </label>
                      <input
                        type="text"
                        value={formData.metaKeywords}
                        onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="omurga, bel ağrısı, boyun ağrısı, fizyoterapi"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Virgülle ayırarak yazın
                      </p>
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