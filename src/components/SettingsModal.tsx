'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Globe } from 'lucide-react';
import { useFinanceStore } from '@/store/useStore';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme, setTheme, lang, setLang } = useFinanceStore();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    console.log('🔄 Changing theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative w-full max-w-sm rounded-[32px] p-8 border shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black" style={{color: 'var(--text-primary)'}}>Settings</h2>
              <motion.button 
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{color: 'var(--text-primary)'}}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
              >
                <X size={24}/>
              </motion.button>
            </div>

            <div className="space-y-8">
              {/* ТЕМА */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sun size={18} className="text-amber-500 dark:text-amber-400" />
                  <p className="text-sm font-bold uppercase tracking-widest" style={{color: 'var(--text-secondary)'}}>Theme</p>
                </div>
                
                <div className="space-y-3">
                  {/* Светлая тема */}
                  <motion.button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: theme === 'light' ? 'var(--bg-card)' : 'rgba(217, 217, 217, 0.1)',
                      borderColor: theme === 'light' ? '#3b82f6' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-[20px] border-2 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div style={{backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(217, 217, 217, 0.2)'}} className="p-2.5 rounded-lg">
                        <Sun size={20} className={theme === 'light' ? 'text-blue-600' : 'text-zinc-500'} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Light</p>
                        <p className="text-xs" style={{color: 'var(--text-secondary)'}}>White with accents</p>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <motion.div 
                        layoutId="theme-indicator"
                        className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                      />
                    )}
                  </motion.button>

                  {/* Темная тема */}
                  <motion.button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: theme === 'dark' ? 'var(--bg-card)' : 'rgba(217, 217, 217, 0.1)',
                      borderColor: theme === 'dark' ? '#3b82f6' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-[20px] border-2 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div style={{backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(217, 217, 217, 0.2)'}} className="p-2.5 rounded-lg">
                        <Moon size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-zinc-500'} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Dark</p>
                        <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Premium look</p>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <motion.div 
                        layoutId="theme-indicator"
                        className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                      />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* ЯЗЫК */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-emerald-500 dark:text-emerald-400" />
                  <p className="text-sm font-bold uppercase tracking-widest" style={{color: 'var(--text-secondary)'}}>Language</p>
                </div>
                
                <div style={{backgroundColor: 'var(--bg-button)'}} className="grid grid-cols-2 gap-3 p-1.5 rounded-[16px]">
                  <motion.button 
                    onClick={() => setLang('ru')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: lang === 'ru' ? 'var(--bg-card)' : 'transparent',
                      color: lang === 'ru' ? '#2563eb' : 'var(--text-secondary)'
                    }}
                    className="py-3 rounded-[12px] font-bold transition-all"
                  >
                    🇷🇺 RU
                  </motion.button>
                  <motion.button 
                    onClick={() => setLang('en')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: lang === 'en' ? 'var(--bg-card)' : 'transparent',
                      color: lang === 'en' ? '#2563eb' : 'var(--text-secondary)'
                    }}
                    className="py-3 rounded-[12px] font-bold transition-all"
                  >
                    🇬🇧 EN
                  </motion.button>
                </div>
              </div>

              {/* Информационный блок */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                  ✨ Все изменения сохраняются автоматически
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}