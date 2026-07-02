import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import Forum from "./pages/Forum";
import Clinicians from "./pages/Clinicians";
import MRAnalyzer from "./pages/MRAnalyzer";
import MedicalGlossary from "./pages/MedicalGlossary";
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
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVideos from "./pages/admin/Videos";
import AdminQuestions from "./pages/admin/Questions";
import AdminBlog from "./pages/admin/Blog";
import AdminTerms from "./pages/admin/Terms";
import AdminMedicalTerms from "./pages/admin/MedicalTerms";
import AdminFAQ from "./pages/admin/FAQ";
import AdminMessages from "./pages/admin/Messages";
import AdminSubscribers from "./pages/admin/Subscribers";
import AdminAppointments from "./pages/admin/Appointments";
import AdminBanners from "./pages/admin/Banners";
import AdminClinicalNotes from "./pages/admin/ClinicalNotes";
import AdminUsers from "./pages/admin/Users";
import AdminSiteSettings from "./pages/admin/SiteSettings";
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
      { path: "kaleminden", Component: Blog },
      { path: "blog/:id", Component: BlogPost },
      { path: "klinisyenler", Component: Clinicians },
      { path: "soru-sor", Component: AskQuestion },
      { path: "soru/:id", Component: QuestionDetail },
      { path: "forum", Component: Forum },
      { path: "mr-analiz", Component: MRAnalyzer },
      { path: "saglik-sozlugu", Component: MedicalGlossary },
      { path: "gunun-terimi", Component: WordGame },
      { path: "mit-avi", Component: MythGame },
      { path: "hakkimizda", Component: About },
      { path: "iletisim", Component: Contact },
      { path: "randevu", Component: Appointment },
      { path: "gizlilik", Component: Privacy },
      { path: "kullanim-kosullari", Component: Terms },
      { path: "politika/:slug", Component: PolicyPage },
      { path: "basin", Component: Press },
      { path: "sorular", Component: FAQ },
      { path: "giris", Component: Login },
      { path: "kayit", Component: Register },
      { path: "profil", Component: Profile },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/videolar", Component: AdminVideos },
      { path: "admin/sorular", Component: AdminQuestions },
      { path: "admin/blog", Component: AdminBlog },
      { path: "admin/omurgam-ne-diyor", Component: AdminBlog },
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