import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { questionsAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function AskQuestion() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    excerpt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isAuthenticated || !user) {
      toast.error('Soru sormak için giriş yapmalısınız');
      navigate('/giris');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create excerpt from first 100 characters
      const excerpt = formData.question.substring(0, 100) + (formData.question.length > 100 ? '...' : '');
      
      await questionsAPI.create({
        question: formData.question,
        excerpt,
        category: formData.category,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      });

      toast.success('Sorunuz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.');
      setFormData({ category: '', question: '', excerpt: '' });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting question:', error);
      toast.error(error.message || 'Soru gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <MessageSquare className="w-16 h-16 text-amber-700 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Soru Sor</h1>
          <p className="text-lg text-slate-600">Prof. Dr. Defne Kaya Utlu'ya sorunuzu gönderin</p>
          {!isAuthenticated && (
            <p className="mt-4 text-amber-700 font-semibold">
              ⚠️ Soru sormak için <a href="/giris" className="underline">giriş yapmalısınız</a>
            </p>
          )}
        </div>

        <div className="backdrop-blur-xl bg-white/90 border border-amber-200/30 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Display (if logged in) */}
            {isAuthenticated && user && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                <div className="text-sm text-teal-800">
                  <span className="font-semibold">Gönderen:</span> {user.name} ({user.email})
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={!isAuthenticated}
              >
                <option value="">Seçiniz</option>
                <option>Bel Fıtığı</option>
                <option>Boyun Ağrısı</option>
                <option>Skolyoz</option>
                <option>Postür Bozukluğu</option>
                <option>Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Sorunuz</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={6}
                placeholder="Sorunuzu buraya yazın..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                required
                disabled={!isAuthenticated}
              />
              <p className="mt-2 text-xs text-slate-500">
                Sorunuz admin onayından sonra platforma yayınlanacak ve Prof. Dr. Defne Kaya Utlu tarafından yanıtlanacaktır.
              </p>
            </div>

            <button
              type="submit"
              disabled={!isAuthenticated || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Soruyu Gönder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}