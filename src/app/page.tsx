'use client'
import { useEffect, useState, useMemo } from 'react';
import { Tab, Period } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, Loader2, User, ArrowUpRight, ArrowDownLeft, DollarSign, Trash2, BadgeRussianRuble } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Локальные компоненты
import BalanceCard from '@/components/BalanceCard';
import AddTransaction from '@/components/AddTransaction';
import Filters from '@/components/Filters';
import SettingsModal from '@/components/SettingsModal';
import AppModal from '@/components/AppModal';

// Глобальное состояние и база данных
import { useFinanceStore } from '@/store/useStore';
import { Transaction } from '@/types';
import { supabase } from '@/lib/supabase';
import { translations, detectBrowserLanguage } from '@/lib/translations';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });

export default function Home() {
  const router = useRouter();
  
  // Достаем всё необходимое из глобального стора (включая валюту и курс)
  const { 
    transactions, setTransactions, 
    categories, setCategories, 
    lang, 
    currency, setCurrency, 
    rate, setRate,
    clearUserData,
    removeTransaction
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<Tab>('all'); 
  const [activePeriod, setActivePeriod] = useState<Period>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; tr: { id: string } | null }>({ open: false, tr: null });
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const t = translations[lang as keyof typeof translations];

  // 0. ИНИЦИАЛИЗАЦИЯ ЯЗЫКА БРАУЗЕРА (при первой загрузке)
  useEffect(() => {
    // Проверяем наличие сохраненного языка в localStorage
    const stored = localStorage.getItem('zen-finance-storage');
    const savedState = stored ? JSON.parse(stored) : null;
    
    if (!savedState || !savedState.state?.lang) {
      // Если языка нет в localStorage, используем язык браузера
      const browserLang = detectBrowserLanguage();
      useFinanceStore.getState().setLang(browserLang);
    }
  }, []);

  // 1. ЗАГРУЗКА КУРСА ВАЛЮТ (Обновляем глобальный стор)
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 сек timeout
        
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        
        const data = await res.json();
        if (data && data.rates && data.rates.RUB) {
          setRate(data.rates.RUB);
        } else {
          console.warn("Курс RUB не найден в ответе API");
          setRate(92); // Запасной вариант
        }
      } catch (err: any) {
        console.error("Ошибка загрузки курса валют:", err?.message || err);
        setRate(92); // Дефолтный курс при ошибке
      }
    };
    fetchRate();
  }, [setRate]);

  // 2. ФУНКЦИЯ ФОРМАТИРОВАНИЯ (Для карточек и истории)
  const formatVal = (val: number) => {
    const converted = currency === 'RUB' ? val : val / rate;
    const sign = currency === 'RUB' ? '₽' : '$';
    return {
      text: converted.toLocaleString(undefined, { 
        minimumFractionDigits: currency === 'USD' ? 2 : 0, 
        maximumFractionDigits: 2 
      }),
      sign
    };
  };

  // 3. ИНИЦИАЛИЗАЦИЯ ДАННЫХ (только свои транзакции и категории по user_id)
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        const userId = session.user.id;
        setUserEmail(session.user.email || 'User');

        const [tx, cat] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('user_id', userId)
        ]);

        if (tx.data) setTransactions(tx.data);
        if (cat.data) setCategories(cat.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoading(false);
      }
    };
    initApp();
  }, [router, setTransactions, setCategories]);

  const handleLogout = async () => {
    clearUserData();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/login');
  };

  const doDeleteTransaction = async () => {
    if (!deleteModal.tr) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', deleteModal.tr.id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Delete error:', error);
      } else {
        removeTransaction(deleteModal.tr.id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      // Даже если ошибка - удаляем из локального состояния
      removeTransaction(deleteModal.tr.id);
    }
    setDeleteModal({ open: false, tr: null });
  };

  // 4. ФИЛЬТРАЦИЯ
  const filteredData = useMemo(() => {
    return transactions.filter((tr: Transaction) => {
      const date = new Date(tr.created_at || '');
      const now = new Date();
      let pMatch = true;
      if (activePeriod === 'day') pMatch = date.toDateString() === now.toDateString();
      else if (activePeriod === 'week') pMatch = date >= new Date(new Date().setDate(now.getDate() - 7));
      else if (activePeriod === 'month') pMatch = date.getMonth() === now.getMonth();
      return pMatch && (activeTab === 'all' || tr.type === activeTab);
    });
  }, [transactions, activePeriod, activeTab]);

  const inc = filteredData.filter((i: Transaction) => i.type === 'income').reduce((a: number, b: Transaction) => a + Number(b.amount), 0);
  const exp = filteredData.filter((i: Transaction) => i.type === 'expense').reduce((a: number, b: Transaction) => a + Number(b.amount), 0);

  if (loading) return (
    <div style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}} className="h-screen flex items-center justify-center transition-colors duration-500">
      <Loader2 className="animate-spin text-blue-600"/>
    </div>
  );

  return (
    <main style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }} className="min-h-screen p-4 pb-32 transition-colors duration-500">
      <header className="flex justify-between items-center py-6 max-w-2xl mx-auto px-2">
        <div className="flex items-center gap-3">
          <div style={{backgroundColor: 'var(--bg-button)', borderColor: 'var(--border-primary)'}} className="w-12 h-12 rounded-2xl shadow-lg shadow-blue-500/5 border flex items-center justify-center text-blue-600">
            <User size={20}/>
          </div>
          <div className="leading-none">
            <p className="text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1">{t.greet},</p>
            <h1 className="text-sm font-black truncate max-w-[150px]">{userEmail.split('@')[0]}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ВАЛЮТЫ (Обновляет глобальный стор) */}
          <button 
            onClick={() => setCurrency(currency === 'RUB' ? 'USD' : 'RUB')}
            style={{backgroundColor: 'var(--bg-button)', borderColor: 'var(--border-primary)'}}
            className="p-3 rounded-2xl border shadow-sm hover:opacity-80 active:scale-90 transition-all flex items-center gap-2"
          >
            {currency === 'RUB' ? <BadgeRussianRuble size={20} className="text-blue-500" /> : <DollarSign size={20} className="text-green-500" />}
            <span className="text-[10px] font-bold">{currency}</span>
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            style={{backgroundColor: 'var(--bg-button)', borderColor: 'var(--border-primary)'}}
            className="p-3 rounded-2xl border shadow-sm hover:opacity-80 active:scale-90 transition-all"
          >
            <Settings size={20}/>
          </button>
          <button 
            onClick={handleLogout} 
            style={{backgroundColor: 'var(--bg-button)', borderColor: 'var(--border-primary)'}}
            className="p-3 rounded-2xl border shadow-sm text-red-500 hover:bg-red-50 active:scale-90 transition-all"
          >
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Баланс теперь принимает параметры из стора */}
        <BalanceCard 
          amount={inc - exp} 
          title={t.balance} 
          currencySign={currency === 'RUB' ? '₽' : '$'} 
          rate={currency === 'RUB' ? 1 : rate}
        />

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <motion.div whileHover={{ y: -5 }} style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}} className="p-5 md:p-7 rounded-[24px] border shadow-xl shadow-green-500/5 relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute -right-2 -top-2 opacity-10 text-green-500 group-hover:scale-110 transition-transform">
              <ArrowUpRight size={50}/>
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-3">{t.income}</p>
            <p className="text-xl md:text-2xl font-black" style={{color: 'var(--text-primary)'}}>
              {currency === 'RUB' ? '+' : ''}{formatVal(inc).text} {formatVal(inc).sign}
            </p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}} className="p-5 md:p-7 rounded-[24px] border shadow-xl shadow-red-500/5 relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute -right-2 -top-2 opacity-10 text-red-500 group-hover:scale-110 transition-transform">
              <ArrowDownLeft size={50}/>
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-3">{t.expense}</p>
            <p className="text-xl md:text-2xl font-black" style={{color: 'var(--text-primary)'}}>
              {currency === 'RUB' ? '-' : ''}{formatVal(exp).text} {formatVal(exp).sign}
            </p>
          </motion.div>
        </div>

        {/* График также использует данные из стора */}
        <Chart 
          data={filteredData} 
          currencySign={currency === 'RUB' ? '₽' : '$'} 
          rate={currency === 'RUB' ? 1 : rate} 
        />
        
        <Filters 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          activePeriod={activePeriod} setActivePeriod={setActivePeriod} 
        />

        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{color: 'var(--text-primary)'}}>{t.history}</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{color: 'var(--text-secondary)'}}>{filteredData.length} {t.ops}</span>
          </div>
          
          <AnimatePresence mode="popLayout">
            {filteredData.map((tr) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={tr.id}
                style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}}
                className="group flex items-center justify-between gap-3 p-5 rounded-[28px] border shadow-sm hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div style={{backgroundColor: 'var(--bg-button)'}} className="w-14 h-14 shrink-0 rounded-[22px] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                    {categories.find(c => c.name === tr.category)?.icon || '📦'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{color: 'var(--text-primary)'}}>{tr.category}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{color: 'var(--text-secondary)'}}>
                      {tr.created_at ? new Date(tr.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`font-black text-lg ${tr.type === 'income' ? 'text-green-600 dark:text-green-400' : ''}`} style={{color: tr.type === 'expense' ? 'var(--text-primary)' : undefined}}>
                    {tr.type === 'income' ? '+' : '-'}{formatVal(tr.amount).text} {formatVal(tr.amount).sign}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ open: true, tr: { id: tr.id } })}
                    className="p-2 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={lang === 'ru' ? 'Удалить' : 'Delete'}
                    aria-label={lang === 'ru' ? 'Удалить' : 'Delete'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredData.length === 0 && (
            <div className="py-20 text-center opacity-20 text-xs font-black uppercase tracking-[0.4em]" style={{color: 'var(--text-primary)'}}>
              {t.empty}
            </div>
          )}
        </section>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AppModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, tr: null })}
        title={t.deleteConfirmTitle}
        message={t.deleteConfirmMessage}
        variant="danger"
        primaryButton={{ text: t.deleteBtn, onClick: doDeleteTransaction }}
        secondaryButton={{ text: t.cancelBtn, onClick: () => {} }}
      />
      <AddTransaction />
    </main>
  );
}