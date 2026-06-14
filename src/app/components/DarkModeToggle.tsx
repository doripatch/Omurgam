import { useStore } from '../store/useStore';
import { Moon, Sun } from 'lucide-react';
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
    <button
      onClick={toggleDarkMode}
      title={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
    >
      {isDarkMode ? (
        <Moon className="w-[18px] h-[18px] text-amber-400" />
      ) : (
        <Sun className="w-[18px] h-[18px] text-amber-500" />
      )}
    </button>
  );
}
