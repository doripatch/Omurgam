import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Flame, Trophy, Clock, Calendar, TrendingUp, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExerciseTracker() {
  const { exerciseSessions, currentStreak, longestStreak, totalMinutes, calculateStreak } = useStore();

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  // Get calendar heatmap data (last 60 days)
  const getHeatmapData = () => {
    const days = 60;
    const today = new Date();
    const heatmap = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const sessionsOnDay = exerciseSessions.filter(s => s.date === dateStr);
      const totalDuration = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0);
      
      heatmap.push({
        date: dateStr,
        count: sessionsOnDay.length,
        duration: totalDuration,
      });
    }
    
    return heatmap;
  };

  const heatmapData = getHeatmapData();
  
  // Get intensity color
  const getIntensityColor = (duration: number) => {
    if (duration === 0) return 'bg-stone-200 dark:bg-slate-700';
    if (duration < 10) return 'bg-amber-200 dark:bg-amber-900';
    if (duration < 20) return 'bg-amber-400 dark:bg-amber-700';
    if (duration < 30) return 'bg-amber-600 dark:bg-amber-600';
    return 'bg-amber-700 dark:bg-amber-500';
  };

  // Celebrate milestones
  useEffect(() => {
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentStreak]);

  // Recent sessions
  const recentSessions = exerciseSessions.slice(-5).reverse();

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 overflow-hidden group"
        >
          <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
            <Flame className="w-20 h-20 text-white" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-white" />
              <p className="text-sm font-bold text-white/90 uppercase tracking-wide">Streak</p>
            </div>
            <p className="text-4xl font-black text-white mb-1">{currentStreak}</p>
            <p className="text-sm text-white/80 font-medium">Gün üst üste 🔥</p>
          </div>
        </motion.div>

        {/* Longest Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-amber-600" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Rekor</p>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{longestStreak}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">En uzun streak</p>
          </div>
        </motion.div>

        {/* Total Minutes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-blue-600" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Süre</p>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{totalMinutes}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Dakika egzersiz</p>
          </div>
        </motion.div>

        {/* Total Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-green-600" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Toplam</p>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{exerciseSessions.length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Egzersiz yapıldı</p>
          </div>
        </motion.div>
      </div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Egzersiz Geçmişi</h3>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {heatmapData.map((day, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${getIntensityColor(day.duration)} transition-all hover:scale-150 hover:z-10 cursor-pointer`}
              title={`${day.date}: ${day.count} egzersiz, ${day.duration}dk`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
          <span>Az</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-stone-200 dark:bg-slate-700" />
            <div className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900" />
            <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700" />
            <div className="w-3 h-3 rounded-sm bg-amber-600 dark:bg-amber-600" />
            <div className="w-3 h-3 rounded-sm bg-amber-700 dark:bg-amber-500" />
          </div>
          <span>Çok</span>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Son Egzersizler</h3>
          </div>
          
          <div className="space-y-3">
            {recentSessions.map((session, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-700/50 rounded-xl"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{session.videoTitle}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{session.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amber-600">{session.duration}dk</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Message */}
      {currentStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-center"
        >
          <p className="text-2xl font-black text-white mb-2">
            🎉 Harika gidiyorsun! {currentStreak} gün streak!
          </p>
          <p className="text-white/90 font-medium">
            Devam et, omurga sağlığın için mükemmel bir iş çıkarıyorsun!
          </p>
        </motion.div>
      )}
    </div>
  );
}
