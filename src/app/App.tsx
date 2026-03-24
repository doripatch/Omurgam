import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './store/authStore';
import 'react-quill/dist/quill.snow.css';

export default function App() {
  const checkSession = useAuthStore((state) => state.checkSession);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app: check Supabase session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // IMPORTANT: Clear old localStorage data (migration from localStorage to Supabase)
        const legacyKeys = ['omurgam_users', 'omurgam_videos', 'omurgam_blog_posts', 
                           'omurgam_questions', 'omurgam_answers', 'omurgam_mr_terms',
                           'omurgam_current_user'];
        
        legacyKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            console.log(`🧹 Cleaning legacy data: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Check session from Supabase
        await checkSession();
        
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [checkSession]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Omurgam yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}