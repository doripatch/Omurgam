import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import Root from "./Root";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import MigratedBlogPost from "./pages/MigratedBlogPost";
import ClinicianNote from "./pages/ClinicianNote";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import Forum from "./pages/Forum";
import Clinicians from "./pages/Clinicians";
import MRAnalyzer from "./pages/MRAnalyzer";
import MedicalGlossary from "./pages/MedicalGlossary";
import SpineGlossary from "./pages/SpineGlossary";
import WordGame from "./pages/WordGame";
import MythGame from "./pages/MythGame";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PolicyPage from "./pages/PolicyPage";
import Press from "./pages/Press";
import Pillar from "./pages/Pillar";
import FAQ from "./pages/FAQ";
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
      { path: "videolar", Component: Videos },
      { path: "video/:id", Component: VideoDetail },
      { path: "blog", Component: Blog },
      { path: "saglikli-yasam", Component: Blog },
      { path: "omurgam-ne-diyor", Component: Blog },
      { path: "yatak-yastik-rehberi", Component: Blog },
      { path: "kaleminden", Component: Blog },
      { path: "blog/:id", Component: BlogPost },
      // Faz 1 — yeni aile detay URL'leri (slug -> UUID merkezi harita üzerinden çözülür).
      { path: "saglikli-yasam/:slug", Component: MigratedBlogPost },
      { path: "omurgam-ne-diyor/:slug", Component: MigratedBlogPost },
      { path: "yatak-yastik-rehberi/:slug", Component: MigratedBlogPost },
      { path: "klinisyenler", Component: Clinicians },
      { path: "klinisyenler/:slug", Component: ClinicianNote },
      { path: "soru-sor", Component: AskQuestion },
      { path: "soru/:id", Component: QuestionDetail },
      { path: "forum", Component: Forum },
      { path: "mr-analiz", Component: MRAnalyzer },
      { path: "mr-analiz/:slug", Component: MRAnalyzer },
      { path: "saglik-sozlugu", Component: MedicalGlossary },
      { path: "omurga-sozlugu", Component: SpineGlossary },
      { path: "omurga-sozlugu/:slug", Component: SpineGlossary },
      { path: "gunun-terimi", Component: WordGame },
      { path: "mit-avi", Component: MythGame },
      { path: "hakkimizda", Component: About },
      { path: "iletisim", Component: Contact },
      { path: "randevu", Component: Appointment },
      { path: "gizlilik", Component: Privacy },
      { path: "kullanim-kosullari", Component: Terms },
      { path: "politika/:slug", Component: PolicyPage },
      { path: "basin", Component: Press },
      { path: "bel-fitigi", Component: Pillar },
      { path: "boyun-fitigi", Component: Pillar },
      { path: "skolyoz", Component: Pillar },
      { path: "sorular", Component: FAQ },
      { path: "giris", Component: Login },
      { path: "kayit", Component: Register },
      { path: "profil", Component: Profile },
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