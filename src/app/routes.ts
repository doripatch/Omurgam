import { createBrowserRouter } from "react-router";
import { lazy, type ComponentType } from "react";
import Root from "./Root";
import Home from "./pages/Home";
// Public sayfalar route-bazlı ayrı paketlerde (ana paket küçülür → anasayfa LCP/FCP). Anasayfa ve NotFound ana pakette.
// İlk açılışta main.tsx, router bu paketi yükleyene kadar render'ı bekletir; prerender edilmiş HTML bu sırada ekranda kalır.
const page = (load: () => Promise<{ default: ComponentType }>) => ({
  lazy: () => load().then((m) => ({ Component: m.default })),
});
// Admin route'ları lazy — normal (public) ziyaretçinin ana bundle'ından çıkarılır.
// SEO'suz (robots'ta disallow) olduğundan güvenli; Root'taki Suspense fallback ile sarılır.
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminVideos = lazy(() => import("./pages/admin/Videos"));
const AdminQuestions = lazy(() => import("./pages/admin/Questions"));
const AdminBlog = lazy(() => import("./pages/admin/Blog"));
const AdminTerms = lazy(() => import("./pages/admin/Terms"));
const AdminMedicalTerms = lazy(() => import("./pages/admin/MedicalTerms"));
const AdminFAQ = lazy(() => import("./pages/admin/FAQ"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminSubscribers = lazy(() => import("./pages/admin/Subscribers"));
const AdminAppointments = lazy(() => import("./pages/admin/Appointments"));
const AdminBanners = lazy(() => import("./pages/admin/Banners"));
const AdminClinicalNotes = lazy(() => import("./pages/admin/ClinicalNotes"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminSiteSettings = lazy(() => import("./pages/admin/SiteSettings"));
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "videolar", ...page(() => import("./pages/Videos")) },
      // Yeni okunabilir video detay URL'si (slug -> canonical UUID merkezi harita ile çözülür).
      { path: "videolar/:slug", ...page(() => import("./pages/MigratedVideoDetail")) },
      // Eski route: 301 yayına alınana kadar kodda korunur (davranış değişmedi).
      { path: "video/:id", ...page(() => import("./pages/VideoDetail")) },
      { path: "blog", ...page(() => import("./pages/Blog")) },
      { path: "saglikli-yasam", ...page(() => import("./pages/Blog")) },
      { path: "omurgam-ne-diyor", ...page(() => import("./pages/Blog")) },
      { path: "yatak-yastik-rehberi", ...page(() => import("./pages/Blog")) },
      { path: "kaleminden", ...page(() => import("./pages/Blog")) },
      { path: "blog/:id", ...page(() => import("./pages/BlogPost")) },
      // Faz 1 — yeni aile detay URL'leri (slug -> UUID merkezi harita üzerinden çözülür).
      { path: "saglikli-yasam/:slug", ...page(() => import("./pages/MigratedBlogPost")) },
      { path: "omurgam-ne-diyor/:slug", ...page(() => import("./pages/MigratedBlogPost")) },
      { path: "yatak-yastik-rehberi/:slug", ...page(() => import("./pages/MigratedBlogPost")) },
      { path: "klinisyenler", ...page(() => import("./pages/Clinicians")) },
      { path: "klinisyenler/:slug", ...page(() => import("./pages/ClinicianNote")) },
      { path: "soru-sor", ...page(() => import("./pages/AskQuestion")) },
      { path: "soru/:id", ...page(() => import("./pages/QuestionDetail")) },
      { path: "forum", ...page(() => import("./pages/Forum")) },
      { path: "mr-analiz", ...page(() => import("./pages/MRAnalyzer")) },
      { path: "mr-analiz/:slug", ...page(() => import("./pages/MRAnalyzer")) },
      { path: "saglik-sozlugu", ...page(() => import("./pages/MedicalGlossary")) },
      { path: "omurga-sozlugu", ...page(() => import("./pages/SpineGlossary")) },
      { path: "omurga-sozlugu/:slug", ...page(() => import("./pages/SpineGlossary")) },
      { path: "gunun-terimi", ...page(() => import("./pages/WordGame")) },
      { path: "mit-avi", ...page(() => import("./pages/MythGame")) },
      { path: "hakkimizda", ...page(() => import("./pages/About")) },
      { path: "iletisim", ...page(() => import("./pages/Contact")) },
      { path: "randevu", ...page(() => import("./pages/Appointment")) },
      { path: "gizlilik", ...page(() => import("./pages/Privacy")) },
      { path: "kullanim-kosullari", ...page(() => import("./pages/Terms")) },
      { path: "politika/:slug", ...page(() => import("./pages/PolicyPage")) },
      { path: "basin", ...page(() => import("./pages/Press")) },
      { path: "bel-fitigi", ...page(() => import("./pages/Pillar")) },
      { path: "boyun-fitigi", ...page(() => import("./pages/Pillar")) },
      { path: "skolyoz", ...page(() => import("./pages/Pillar")) },
      { path: "sorular", ...page(() => import("./pages/FAQ")) },
      { path: "giris", ...page(() => import("./pages/Login")) },
      { path: "kayit", ...page(() => import("./pages/Register")) },
      { path: "profil", ...page(() => import("./pages/Profile")) },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/videolar", Component: AdminVideos },
      { path: "admin/sorular", Component: AdminQuestions },
      { path: "admin/blog", Component: AdminBlog },
      { path: "admin/omurgam-ne-diyor", Component: AdminBlog },
      { path: "admin/yatak-yastik", Component: AdminBlog },
      { path: "admin/kosullar", Component: AdminTerms },
      { path: "admin/saglik-sozlugu", Component: AdminMedicalTerms },
      { path: "admin/sss", Component: AdminFAQ },
      { path: "admin/mesajlar", Component: AdminMessages },
      { path: "admin/aboneler", Component: AdminSubscribers },
      { path: "admin/randevular", Component: AdminAppointments },
      { path: "admin/bannerlar", Component: AdminBanners },
      { path: "admin/klinik-notlar", Component: AdminClinicalNotes },
      { path: "admin/kullanicilar", Component: AdminUsers },
      { path: "admin/site-ayarlari", Component: AdminSiteSettings },
      { path: "*", Component: NotFound },
    ],
  },
]);