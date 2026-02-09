'use client'
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/store/useStore';
import { Tab, Period } from '@/types';

interface FiltersProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  activePeriod: Period;
  setActivePeriod: (p: Period) => void;
}

export default function Filters({ activeTab, setActiveTab, activePeriod, setActivePeriod }: FiltersProps) {
  const { lang } = useFinanceStore();
  
  // Словарик для отображения
  const labels: Record<string, { all: string; day: string; week: string; month: string; expense: string; income: string }> = {
    ru: { all: 'Все', day: 'День', week: 'Неделя', month: 'Месяц', expense: 'Расходы', income: 'Доходы' },
    en: { all: 'All', day: 'Day', week: 'Week', month: 'Month', expense: 'Expenses', income: 'Income' }
  };
  const t = labels[lang];

  const periods = [
    { id: 'all', label: t.all },
    { id: 'day', label: t.day },
    { id: 'week', label: t.week },
    { id: 'month', label: t.month },
  ];

  const tabs = [
    { id: 'all', label: t.all },
    { id: 'expense', label: t.expense },
    { id: 'income', label: t.income },
  ];

  return (
    <div className="space-y-6 mb-8 px-2">
      {/* Периоды */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {periods.map((p) => (
          <button key={p.id} onClick={() => setActivePeriod(p.id)}
            style={{backgroundColor: activePeriod === p.id ? '#2563eb' : 'var(--bg-button)', color: activePeriod === p.id ? 'white' : 'var(--text-secondary)'}}
            className="relative px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <span className="relative z-10">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Типы операций (Исправленные ID) */}
      <div style={{backgroundColor: 'var(--bg-button)'}} className="relative flex p-1.5 rounded-[24px]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'}}
            className="relative flex-1 py-3 text-xs font-bold z-10 transition-colors"
          >
            {activeTab === tab.id && <motion.div layoutId="tabBg" style={{backgroundColor: '#2563eb'}} className="absolute inset-0 rounded-[18px] shadow-sm" />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}