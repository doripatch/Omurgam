import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ExerciseSession {
  date: string;
  videoId: string;
  videoTitle: string;
  duration: number;
}

interface Store {
  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Exercise Tracking
  exerciseSessions: ExerciseSession[];
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  
  addExerciseSession: (session: Omit<ExerciseSession, 'date'>) => void;
  calculateStreak: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Dark Mode State
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Exercise Tracking State
      exerciseSessions: [],
      currentStreak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      
      addExerciseSession: (session) => {
        const today = new Date().toISOString().split('T')[0];
        const newSession: ExerciseSession = {
          ...session,
          date: today,
        };
        
        set((state) => {
          const updatedSessions = [...state.exerciseSessions, newSession];
          const totalMinutes = updatedSessions.reduce((sum, s) => sum + s.duration, 0);
          
          return {
            exerciseSessions: updatedSessions,
            totalMinutes,
          };
        });
        
        // Recalculate streak after adding session
        get().calculateStreak();
      },
      
      calculateStreak: () => {
        const sessions = get().exerciseSessions;
        if (sessions.length === 0) {
          set({ currentStreak: 0, longestStreak: 0 });
          return;
        }
        
        // Group sessions by date
        const dateSet = new Set(sessions.map(s => s.date));
        const sortedDates = Array.from(dateSet).sort().reverse();
        
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Start from today or yesterday
        let checkDate = sortedDates[0] === today ? today : yesterday;
        
        for (let i = 0; i < sortedDates.length; i++) {
          if (sortedDates[i] === checkDate) {
            currentStreak++;
            // Move to previous day
            const prevDate = new Date(new Date(checkDate).getTime() - 86400000);
            checkDate = prevDate.toISOString().split('T')[0];
          } else {
            break;
          }
        }
        
        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;
        
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const currentDate = new Date(sortedDates[i]);
          const nextDate = new Date(sortedDates[i + 1]);
          const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / 86400000);
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        
        set({ currentStreak, longestStreak });
      },
    }),
    {
      name: 'omurgam-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);