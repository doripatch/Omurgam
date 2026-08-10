import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Clock, ThumbsUp, MessageCircle, User, Shield, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, TABLES } from '../lib/supabase';
import { toast } from 'sonner';
import Seo from '../components/Seo';

interface Answer {
  id: string;
  answer: string;
  created_at: string;
  users?: {
    name: string;
    role: string;
  };
}

interface Question {
  id: string;
  question: string;
  excerpt: string;
  category: string;
  likes: number;
  created_at: string;
  users?: {
    name: string;
  };
  answers: Answer[];
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Soru detayı yükleniyor:', id);

      const { data, error: questionError } = await supabase
        .from(TABLES.QUESTIONS)
        .select(`
          *,
          users:user_id (name),
          answers (
            id,
            answer,
            created_at,
            users:user_id (name, role)
          )
        `)
        .eq('id', id)
        .single();

      if (questionError) {
        console.error('❌ Soru yükleme hatası:', questionError);
        throw questionError;
      }

      if (!data) {
        setError('Soru bulunamadı');
        return;
      }

      // Sort answers by created_at
      const sortedAnswers = (data.answers || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const formattedQuestion: Question = {
        ...data,
        answers: sortedAnswers
      };

      console.log('✅ Soru yüklendi:', formattedQuestion);
      setQuestion(formattedQuestion);
    } catch (err: any) {
      console.error('❌ Hata:', err);
      setError(err.message || 'Soru yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays === 1) return '1 gün önce';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 flex items-center justify-center">
        <Seo title="Soru & Cevap" description="Omurgam'da omurga sağlığı soruları ve uzman yanıtları." />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Soru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 flex items-center justify-center">
        <Seo title="Soru bulunamadı" description="Aradığınız soru bulunamadı. Omurgam'da omurga sağlığı sorularına göz atın." />
        <div className="backdrop-blur-xl bg-white/90 border border-red-200/30 rounded-3xl p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || 'Soru bulunamadı'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 py-12 px-4">
      <Seo
        title={question.question}
        description={question.excerpt && question.excerpt.trim()
          ? question.excerpt.trim().slice(0, 155)
          : `${question.question} — Omurgam'da uzman yanıtları ve bilimsel bilgilendirme.`}
      />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8 mb-6"
        >
          {/* Category Badge */}
          <div className="flex items-start justify-between mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-bold">
              {question.category}
            </span>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{question.answers.length} cevap</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{question.likes}</span>
              </div>
            </div>
          </div>

          {/* Question */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {question.question}
          </h1>

          {/* Excerpt */}
          {question.excerpt && (
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {question.excerpt}
            </p>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{question.users?.name || 'Kullanıcı'}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answers Section */}
        <div className="backdrop-blur-xl bg-white/90 border border-teal-200/30 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {question.answers.length > 0 ? `Cevaplar (${question.answers.length})` : 'Henüz Cevap Yok'}
          </h2>

          {question.answers.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                Bu soruya henüz cevap verilmedi.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {question.answers.map((answer, index) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${
                    answer.users?.role === 'admin' 
                      ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-300' 
                      : 'bg-slate-50'
                  }`}
                >
                  {/* Answer Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      answer.users?.role === 'admin'
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500'
                        : 'bg-slate-300'
                    }`}>
                      {answer.users?.role === 'admin' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900">
                          {answer.users?.name || 'Kullanıcı'}
                        </p>
                        {answer.users?.role === 'admin' && (
                          <span className="px-2 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-full">
                            Prof. Dr.
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(answer.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Content */}
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {answer.answer}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="font-bold text-slate-900">UYARI:</strong> Bu platformdaki cevaplar yalnızca bilgilendirme amaçlıdır. 
            Tıbbi teşhis, tedavi veya reçete yerine geçmez. Sağlık sorunlarınız için mutlaka hekiminize danışın.
          </p>
        </div>
      </div>
    </div>
  );
}
