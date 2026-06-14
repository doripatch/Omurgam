import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Heart, Menu, X, User, LogOut, LayoutDashboard, Facebook, Twitter, Instagram, Youtube, Linkedin, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import DarkModeToggle from './components/DarkModeToggle';
import FloatingActionButton from './components/FloatingActionButton';
import GlobalSearch from './components/GlobalSearch';
import CookieConsent from './components/CookieConsent';
import { trackPageview } from './lib/analytics';
import { newsletterAPI } from './lib/api';
import { useNotificationsStore } from './store/notificationsStore';
import { useAuthStore } from './store/authStore';
import { useSiteSettingsStore } from './store/siteSettingsStore';
import { toast } from 'sonner';

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { items: notifItems, load: loadNotifs, loaded: notifLoaded, markRead: markNotifRead, markAllRead: markAllNotifsRead } = useNotificationsStore();
  const unreadNotifs = notifItems.filter((n) => !n.read).length;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }
    setNewsletterLoading(true);
    try {
      const res: any = await newsletterAPI.subscribe(newsletterEmail.trim());
      toast.success(res?.alreadySubscribed ? 'Zaten abonesiniz, teşekkürler!' : 'Bültene abone oldunuz! 🎉');
      setNewsletterEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Abone olunamadı, lütfen tekrar deneyin.');
    } finally {
      setNewsletterLoading(false);
    }
  };
  const location = useLocation();
  const navigate = useNavigate();
  
  // Real auth state from Zustand store
  const { isAuthenticated, isAdmin, user, signout } = useAuthStore();
  
  // Site settings from store
  const { settings, fetchSettings } = useSiteSettingsStore();
  
  // Fetch site settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sayfa geçişlerini GA'ya bildir (yalnızca çerez onayı verildiyse çalışır)
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Giriş yapan kullanıcının bildirimlerini yükle
  useEffect(() => {
    if (isAuthenticated && !notifLoaded) loadNotifs();
  }, [isAuthenticated, notifLoaded, loadNotifs]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignout = async () => {
    try {
      await signout();
      toast.success('Çıkış yapıldı');
      navigate('/');
    } catch (error) {
      toast.error('Çıkış yaparken hata oluştu');
    }
  };

  // ESC tuşu ile arama modalını kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      // Cmd+K veya Ctrl+K ile aramayı aç
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-amber-500/10 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
  <img 
    src="/assets/logo.svg" 
    alt="Omurgam Logo" 
    className="w-full h-full object-contain" 
  />
</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  {settings?.logoText || 'Omurgam'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{settings?.siteTagline || 'Prof. Dr. Defne Kaya Utlu'}</p>
              </div>
            </Link>

            {/* Desktop Navigation - ortadaki linkler (tam genişliğe yayılır) */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-7 flex-1 justify-center">
              <Link
                to="/videolar"
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive('/videolar') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Video Arşivi
              </Link>
              <Link 
                to="/blog" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/blog') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Blog
              </Link>
              <Link 
  to="/forum" 
  className={`text-sm font-medium transition-colors ${
    isActive('/forum') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
  }`}
>
  Forum
</Link>
              <Link
                to="/saglik-sozlugu"
                className={`text-sm font-medium transition-colors ${
                  isActive('/saglik-sozlugu') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Sözlük
              </Link>
              <Link
                to="/gunun-terimi"
                className={`text-sm font-medium transition-colors ${
                  isActive('/gunun-terimi') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Oyun
              </Link>
              <Link
                to="/hakkimizda"
                className={`text-sm font-medium transition-colors ${
                  isActive('/hakkimizda') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Hakkımızda
              </Link>
              <Link
                to="/iletisim"
                className={`text-sm font-medium transition-colors ${
                  isActive('/iletisim') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                İletişim
              </Link>
              <Link
                to="/randevu"
                className="text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors whitespace-nowrap"
              >
                Randevu
              </Link>
            </nav>

            {/* Sağ taraf araçları */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Ara (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm hidden lg:inline">Ara</span>
                <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600">
                  ⌘K
                </kbd>
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Bildirim Zili */}
                  <div className="relative">
                    <button
                      onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) loadNotifs(); }}
                      className="relative p-2 rounded-full hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                      title="Bildirimler"
                    >
                      <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      {unreadNotifs > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadNotifs}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">Bildirimler</span>
                            {unreadNotifs > 0 && (
                              <button onClick={() => markAllNotifsRead()} className="text-xs text-amber-600 hover:underline">
                                Tümünü okundu işaretle
                              </button>
                            )}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifItems.length === 0 ? (
                              <div className="p-6 text-center text-sm text-slate-500">Henüz bildiriminiz yok</div>
                            ) : (
                              notifItems.map((n) => (
                                <button
                                  key={n.id}
                                  onClick={() => { markNotifRead(n.id); setNotifOpen(false); if (n.link) navigate(n.link); }}
                                  className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}`}
                                >
                                  <div className="font-medium text-sm text-slate-900 dark:text-white">{n.title}</div>
                                  {n.message && <div className="text-xs text-slate-500 truncate mt-0.5">{n.message}</div>}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      title="Admin Paneli"
                      className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors flex items-center justify-center flex-shrink-0"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                  )}
                  <Link
                    to="/profil"
                    title={user?.name || 'Profilim'}
                    className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleSignout}
                    title="Çıkış Yap"
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/giris"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  <span>Giriş / Kayıt</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-amber-50 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t border-amber-500/10">
              <Link 
                to="/videolar" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/videolar') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Video Arşivi
              </Link>
              <Link 
                to="/blog" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/blog') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Blog
              </Link>
              <Link 
  to="/forum" 
  onClick={() => setMobileMenuOpen(false)}
  className={`block py-2 text-sm font-medium ${
    isActive('/forum') ? 'text-amber-700' : 'text-slate-700'
  }`}
>
  Forum
</Link>
              <Link
                to="/saglik-sozlugu"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/saglik-sozlugu') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Sağlık Sözlüğü
              </Link>
              <Link
                to="/gunun-terimi"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/gunun-terimi') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Günün Terimi (Oyun)
              </Link>
              <Link 
                to="/hakkimizda" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/hakkimizda') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Hakkımızda
              </Link>
              <Link 
                to="/iletisim" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/iletisim') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                İletişim
              </Link>
              <Link
                to="/randevu"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/randevu') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Randevu / Danışma
              </Link>
              <div className="pt-3 border-t border-amber-500/10 space-y-3">
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-purple-600"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Paneli
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/giris"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 rounded-full text-sm font-medium text-center"
                  >
                    Giriş Yap / Kayıt Ol
                  </Link>
                )}
              </div>

            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* KVKK Çerez Onayı */}
      <CookieConsent />

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{settings?.siteName || 'Omurgam'}</h3>
                  <p className="text-sm text-amber-200">{settings?.siteTagline || 'Prof. Dr. Defne Kaya Utlu'}</p>
                </div>
              </div>
              <p className="text-slate-300 mb-4 leading-relaxed">
                {settings?.footerAbout || 'Omurga sağlığınız hakkında bilimsel bilgiler ve eğitici içerikler.'}
              </p>

              {/* E-bülten aboneliği */}
              <div className="mt-6 max-w-md">
                <h4 className="font-semibold mb-2 text-white">Bültene Abone Olun</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Yeni video, blog ve sağlık ipuçlarından ilk siz haberdar olun.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {newsletterLoading ? 'Gönderiliyor...' : 'Abone Ol'}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{settings?.footer?.quickLinksTitle || 'Hızlı Erişim'}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/hakkimizda" className="hover:text-amber-300 transition-colors">Hakkımızda</Link></li>
                <li><Link to="/videolar" className="hover:text-amber-300 transition-colors">Video Arşivi</Link></li>
                <li><Link to="/blog" className="hover:text-amber-300 transition-colors">Blog</Link></li>
                <li><Link to="/mr-analiz" className="hover:text-amber-300 transition-colors">MR Terim Sözlüğü</Link></li>
                <li><Link to="/saglik-sozlugu" className="hover:text-amber-300 transition-colors">Sağlık Sözlüğü</Link></li>
                <li><Link to="/gunun-terimi" className="hover:text-amber-300 transition-colors">Günün Terimi (Oyun)</Link></li>
                <li><Link to="/randevu" className="hover:text-amber-300 transition-colors">Randevu / Danışma</Link></li>
                <li><Link to="/soru-sor" className="hover:text-amber-300 transition-colors">Soru Sor</Link></li>
                <li><Link to="/sorular" className="hover:text-amber-300 transition-colors">Sıkça Sorulan Sorular</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{settings?.footer?.infoTitle || 'Bilgi'}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/iletisim" className="hover:text-amber-300 transition-colors">İletişim</Link></li>
                <li><Link to="/gizlilik" className="hover:text-amber-300 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/kullanim-kosullari" className="hover:text-amber-300 transition-colors">Kullanım Koşulları</Link></li>
              </ul>
              
              {/* Sosyal Medya */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">{settings?.footer?.followTitle || 'Takip Edin'}</h4>
                <div className="flex gap-3">
                  {settings?.instagram && (
                    <a 
                      href={settings.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings?.youtube && (
                    <a 
                      href={settings.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {settings?.linkedin && (
                    <a 
                      href={settings.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {settings?.facebook && (
                    <a 
                      href={settings.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {settings?.twitter && (
                    <a 
                      href={settings.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800 hover:bg-sky-500 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <p>{settings?.footerCopyright || '© 2026 Omurgam. Tüm hakları saklıdır.'}</p>
              <p className="text-xs text-center md:text-right">
                {settings?.footerDisclaimer || 'Bu site bilgilendirme amaçlıdır. Tanı ve tedavi için mutlaka bir uzmana danışın.'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}