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
import MRAnalyzer from "./pages/MRAnalyzer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileDebug from "./pages/ProfileDebug";
import CreateTestUser from "./pages/CreateTestUser";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVideos from "./pages/admin/Videos";
import AdminQuestions from "./pages/admin/Questions";
import AdminBlog from "./pages/admin/Blog";
import AdminTerms from "./pages/admin/Terms";
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
      { path: "blog/:id", Component: BlogPost },
      { path: "soru-sor", Component: AskQuestion },
      { path: "soru/:id", Component: QuestionDetail },
      { path: "mr-analiz", Component: MRAnalyzer },
      { path: "hakkimizda", Component: About },
      { path: "iletisim", Component: Contact },
      { path: "gizlilik", Component: Privacy },
      { path: "kullanim-kosullari", Component: Terms },
      { path: "sorular", Component: FAQ },
      { path: "giris", Component: Login },
      { path: "kayit", Component: Register },
      { path: "profil", Component: Profile },
      { path: "profil-debug", Component: ProfileDebug },
      { path: "test-kullanici-olustur", Component: CreateTestUser },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/videolar", Component: AdminVideos },
      { path: "admin/sorular", Component: AdminQuestions },
      { path: "admin/blog", Component: AdminBlog },
      { path: "admin/kosullar", Component: AdminTerms },
      { path: "admin/kullanicilar", Component: AdminUsers },
      { path: "admin/site-ayarlari", Component: AdminSiteSettings },
      { path: "*", Component: NotFound },
    ],
  },
]);