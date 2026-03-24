import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Play, Search, MessageCircle, Heart } from 'lucide-react';
import { Link } from 'react-router';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Play,
      label: 'Video Arşivi',
      href: '/videolar',
      color: 'from-amber-600 to-orange-600'
    },
    {
      icon: Search,
      label: 'Terim Sözlüğü',
      href: '/mr-analiz',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: MessageCircle,
      label: 'Soru Sor',
      href: '/soru-sor',
      color: 'from-green-600 to-emerald-600'
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full pl-5 pr-4 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {action.label}
                  </span>
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-2xl shadow-amber-500/50 flex items-center justify-center hover:shadow-3xl transition-shadow"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Plus className="w-8 h-8 text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}
