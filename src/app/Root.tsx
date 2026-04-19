import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Heart, Menu, X, User, LogOut, LayoutDashboard, Facebook, Twitter, Instagram, Youtube, Linkedin, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import DarkModeToggle from './components/DarkModeToggle';
import FloatingActionButton from './components/FloatingActionButton';
import GlobalSearch from './components/GlobalSearch';
import { useAuthStore } from './store/authStore';
import { useSiteSettingsStore } from './store/siteSettingsStore';
import { toast } from 'sonner';

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/videolar" 
                className={`text-sm font-medium transition-colors ${
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
                to="/hakkimizda" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/hakkimizda') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Hakkımızda
              </Link>
              <Link 
                to="/sorular" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/sorular') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                SSS
              </Link>
              <Link 
                to="/iletisim" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/iletisim') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                İletişim
              </Link>
              
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
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/profil"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">{user?.name || 'Profilim'}</span>
                  </Link>
                  <button 
                    onClick={handleSignout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
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
            </nav>

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
                to="/hakkimizda" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/hakkimizda') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                Hakkımızda
              </Link>
              <Link 
                to="/sorular" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive('/sorular') ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                SSS
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
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hızlı Erişim</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/hakkimizda" className="hover:text-amber-300 transition-colors">Hakkımızda</Link></li>
                <li><Link to="/videolar" className="hover:text-amber-300 transition-colors">Video Arşivi</Link></li>
                <li><Link to="/blog" className="hover:text-amber-300 transition-colors">Blog</Link></li>
                <li><Link to="/mr-analiz" className="hover:text-amber-300 transition-colors">Terim Sözlüğü</Link></li>
                <li><Link to="/soru-sor" className="hover:text-amber-300 transition-colors">Soru Sor</Link></li>
                <li><Link to="/sorular" className="hover:text-amber-300 transition-colors">Sıkça Sorulan Sorular</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Bilgi</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/iletisim" className="hover:text-amber-300 transition-colors">İletişim</Link></li>
                <li><Link to="/gizlilik" className="hover:text-amber-300 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/kullanim-kosullari" className="hover:text-amber-300 transition-colors">Kullanım Koşulları</Link></li>
              </ul>
              
              {/* Sosyal Medya */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Takip Edin</h4>
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