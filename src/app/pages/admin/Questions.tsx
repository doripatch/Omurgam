import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Eye, AtSign, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { questionsAPI } from '../../lib/api';
import { supabase, TABLES, createAuthenticatedClient } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Question {
  id: string;
  user_id: string;
  question: string;
  excerpt: string;
  category: string;
  is_answered: boolean;
  likes: number;
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
}

export default function AdminQuestions() {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [answerModal, setAnswerModal] = useState<{
    isOpen: boolean;
    question: Question | null;
    answer: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    question: null,
    answer: '',
    isSubmitting: false,
  });

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Admin paneli soruları yükleniyor...');
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select(`
          *,
          users:user_id (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Toplam soru sayısı:', data?.length);
      console.log('📊 Bekleyen:', data?.filter(q => !q.is_answered).length);
      console.log('📊 Yanıtlanan:', data?.filter(q => q.is_answered).length);
      console.log('📋 Sorular:', data);
      
      setQuestions(data || []);
    } catch (error: any) {
      console.error('❌ Error loading questions:', error);
      toast.error('Sorular yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleApprove = async (questionId: string) => {
    // Open answer modal instead of just approving
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    setAnswerModal({
      isOpen: true,
      question,
      answer: '',
      isSubmitting: false,
    });
  };

  const handleSubmitAnswer = async () => {
    if (!answerModal.question || !answerModal.answer.trim()) {
      toast.error('Lütfen bir yanıt yazın');
      return;
    }

    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!session) {
      toast.error('Oturum bulunamadı - lütfen tekrar giriş yapın');
      return;
    }

    setAnswerModal(prev => ({ ...prev, isSubmitting: true }));

    try {
      console.log('📝 Yanıt gönderiliyor (authenticated client)...', {
        question_id: answerModal.question.id,
        user_id: user.id,
        answer_preview: answerModal.answer.substring(0, 50),
        has_session: !!session,
      });

      // Create authenticated Supabase client with user session
      const authClient = createAuthenticatedClient(session);

      // Step 1: Insert answer into answers table
      const { data: answerData, error: answerError } = await authClient
        .from(TABLES.ANSWERS)
        .insert({
          question_id: answerModal.question.id,
          user_id: user.id,
          answer: answerModal.answer,
        })
        .select();

      if (answerError) {
        console.error('❌ Answer insert error:', answerError);
        throw new Error(answerError.message);
      }

      if (!answerData || answerData.length === 0) {
        console.error('❌ No answer data returned');
        throw new Error('Yanıt kaydedilemedi - RLS policy hatası olabilir');
      }

      console.log('✅ Answer created:', answerData[0]);

      // Step 2: Update question as answered
      const { data: questionData, error: questionError } = await authClient
        .from(TABLES.QUESTIONS)
        .update({ is_answered: true })
        .eq('id', answerModal.question.id)
        .select();

      if (questionError) {
        console.error('❌ Question update error:', questionError);
        throw new Error(questionError.message);
      }

      if (!questionData || questionData.length === 0) {
        console.error('❌ No question data returned');
        throw new Error('Soru güncellenemedi - RLS policy hatası olabilir');
      }

      console.log('✅ Question marked as answered:', questionData[0]);

      toast.success('Yanıt başarıyla gönderildi!');
      
      // Close modal and reload questions
      setAnswerModal({
        isOpen: false,
        question: null,
        answer: '',
        isSubmitting: false,
      });
      
      console.log('🔄 Sorular yeniden yükleniyor...');
      await loadQuestions();
      
      // Automatically switch to "answered" filter
      setFilter('answered');
      console.log('✅ İşlem tamamlandı!');
    } catch (error: any) {
      console.error('❌ Error submitting answer:', error);
      toast.error(error.message || 'Yanıt gönderilirken hata oluştu');
    } finally {
      setAnswerModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;

    if (!session) {
      toast.error('Oturum bulunamadı - lütfen tekrar giriş yapın');
      return;
    }

    try {
      console.log('🗑️ Soru siliniyor:', questionId);

      // Create authenticated Supabase client
      const authClient = createAuthenticatedClient(session);

      // First delete associated answers
      const { error: answersError } = await authClient
        .from(TABLES.ANSWERS)
        .delete()
        .eq('question_id', questionId);

      if (answersError) {
        console.error('❌ Answers delete error:', answersError);
        throw new Error('Yanıtlar silinirken hata oluştu');
      }

      // Then delete the question
      const { error: questionError } = await authClient
        .from(TABLES.QUESTIONS)
        .delete()
        .eq('id', questionId);

      if (questionError) {
        console.error('❌ Question delete error:', questionError);
        throw questionError;
      }
      
      console.log('✅ Soru ve yanıtları silindi');
      toast.success('Soru başarıyla silindi');
      
      // Reload questions to update stats
      await loadQuestions();
    } catch (error: any) {
      console.error('❌ Error deleting question:', error);
      toast.error(error.message || 'Soru silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async (type: 'all' | 'answered') => {
    const message = type === 'all' 
      ? 'TÜM SORULARI silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!' 
      : 'TÜM YANITLANMIŞ SORULARI silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!';
    
    if (!confirm(message)) return;

    if (!session) {
      toast.error('Oturum bulunamadı - lütfen tekrar giriş yapın');
      return;
    }

    try {
      console.log(`🗑️ Toplu silme başlatılıyor: ${type}`);

      const questionsToDelete = type === 'all' 
        ? questions 
        : questions.filter(q => q.is_answered);

      if (questionsToDelete.length === 0) {
        toast.info('Silinecek soru bulunamadı');
        return;
      }

      const questionIds = questionsToDelete.map(q => q.id);

      // Create authenticated Supabase client
      const authClient = createAuthenticatedClient(session);

      // First delete all answers for these questions
      const { error: answersError } = await authClient
        .from(TABLES.ANSWERS)
        .delete()
        .in('question_id', questionIds);

      if (answersError) {
        console.error('❌ Bulk answers delete error:', answersError);
        throw new Error('Yanıtlar silinirken hata oluştu');
      }

      // Then delete all questions
      const { error: questionsError } = await authClient
        .from(TABLES.QUESTIONS)
        .delete()
        .in('id', questionIds);

      if (questionsError) {
        console.error('❌ Bulk questions delete error:', questionsError);
        throw questionsError;
      }

      console.log(`✅ ${questionIds.length} soru ve yanıtları silindi`);
      toast.success(`${questionIds.length} soru başarıyla silindi`);
      
      // Reload questions to update stats
      await loadQuestions();
      
      // Reset filter to 'all'
      setFilter('all');
    } catch (error: any) {
      console.error('❌ Error bulk deleting:', error);
      toast.error(error.message || 'Toplu silme işlemi başarısız');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'pending') return !q.is_answered;
    if (filter === 'answered') return q.is_answered;
    return true;
  });

  const pendingCount = questions.filter(q => !q.is_answered).length;
  const answeredCount = questions.filter(q => q.is_answered).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Soru Yönetimi</h1>
          <p className="text-slate-600">Kullanıcı sorularını yönetin ve yanıtlayın</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`backdrop-blur-xl border rounded-2xl p-6 transition-all ${
              filter === 'all' 
                ? 'bg-teal-100 border-teal-300' 
                : 'bg-white/90 border-purple-200/30 hover:bg-white'
            }`}
          >
            <div className="text-3xl font-bold text-slate-900">{questions.length}</div>
            <div className="text-slate-600">Toplam Soru</div>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`backdrop-blur-xl border rounded-2xl p-6 transition-all ${
              filter === 'pending' 
                ? 'bg-amber-100 border-amber-300' 
                : 'bg-white/90 border-purple-200/30 hover:bg-white'
            }`}
          >
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-slate-600">Bekleyen</div>
          </button>

          <button
            onClick={() => setFilter('answered')}
            className={`backdrop-blur-xl border rounded-2xl p-6 transition-all ${
              filter === 'answered' 
                ? 'bg-emerald-100 border-emerald-300' 
                : 'bg-white/90 border-purple-200/30 hover:bg-white'
            }`}
          >
            <div className="text-3xl font-bold text-emerald-600">{answeredCount}</div>
            <div className="text-slate-600">Yanıtlandı</div>
          </button>
        </div>

        {/* Bulk Delete Actions */}
        {!isLoading && questions.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleBulkDelete('answered')}
              disabled={answeredCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              Tüm Yanıtlananları Sil ({answeredCount})
            </button>
            <button
              onClick={() => handleBulkDelete('all')}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all"
            >
              <XCircle className="w-4 h-4" />
              Tüm Soruları Sil ({questions.length})
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredQuestions.length === 0 && (
          <div className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {filter === 'pending' ? 'Bekleyen soru yok' : filter === 'answered' ? 'Yanıtlanmış soru yok' : 'Henüz soru yok'}
            </h3>
            <p className="text-slate-600">
              {filter === 'pending' ? 'Tüm sorular yanıtlanmış!' : 'Kullanıcılar soru gönderdikçe burada görünecekler.'}
            </p>
          </div>
        )}

        {/* Questions Grid */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const userName = q.users?.name || 'Anonim Kullanıcı';
              const userEmail = q.users?.email || '';
              
              return (
                <div key={q.id} className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-amber-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AtSign className="w-4 h-4 text-teal-600" />
                            <h3 className="font-bold text-teal-600">{userName}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>{userEmail}</span>
                            <span>•</span>
                            <span>{getTimeAgo(q.created_at)}</span>
                          </div>
                        </div>
                        {q.is_answered ? (
                          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                            Yanıtlandı
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-full animate-pulse">
                            Bekliyor
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                          {q.category}
                        </span>
                        <p className="text-slate-700 leading-relaxed">{q.question}</p>
                      </div>

                      <div className="flex gap-3">
                        {!q.is_answered && (
                          <button
                            onClick={() => handleApprove(q.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Onayla & Yanıtla
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Answer Modal */}
        {answerModal.isOpen && answerModal.question && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-bold mb-2">Soruyu Yanıtla</h2>
                <p className="text-white/90">Prof. Dr. Defne Kaya Utlu olarak yanıtlayın</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Question Display */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AtSign className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-teal-600">
                      {answerModal.question.users?.name || 'Anonim Kullanıcı'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {answerModal.question.category}
                    </span>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {answerModal.question.question}
                  </p>
                </div>

                {/* Answer Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Yanıtınız
                  </label>
                  <textarea
                    value={answerModal.answer}
                    onChange={(e) => setAnswerModal(prev => ({ ...prev, answer: e.target.value }))}
                    rows={8}
                    placeholder="Soruya detaylı ve bilgilendirici bir yanıt yazın..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    disabled={answerModal.isSubmitting}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    ⚠️ Yanıtınız Sağlık Bakanlığı prosedürlerine uygun olmalı - tedavi vaadi verilmemeli, sadece bilgilendirme amaçlı olmalıdır.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={answerModal.isSubmitting || !answerModal.answer.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {answerModal.isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Gönderiliyor...
                      </span>
                    ) : (
                      'Yanıtı Yayınla'
                    )}
                  </button>
                  <button
                    onClick={() => setAnswerModal({ isOpen: false, question: null, answer: '', isSubmitting: false })}
                    disabled={answerModal.isSubmitting}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors disabled:opacity-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}