import { useStore } from '../store/useStore';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className="relative w-16 h-8 bg-stone-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300"
    >
      <motion.div
        animate={{
          x: isDarkMode ? 32 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center"
      >
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-blue-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
