'use client'
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/store/useStore';
import { Transaction } from '@/types';

// ПАЛИТРА ДЛЯ РАСХОДОВ (Красные и теплые оттенки)
const EXPENSE_COLORS = [
  '#FF4D4D', '#FF0000', '#D90429', '#EF233C', '#8D0801', 
  '#F72585', '#B5179E', '#E63946', '#F08080', '#9B2226'
];

// ПАЛИТРА ДЛЯ ДОХОДОВ (Разнообразные красивые и сочные цвета)
const INCOME_COLORS = [
  '#00F5D4', '#00BBF9', '#9B5DE5', '#F15BB5', '#FEE440', 
  '#31572C', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'
];

const translations = {
  ru: { expense: 'Траты', income: 'Доходы', total: 'Итого' },
  en: { expense: 'Expenses', income: 'Income', total: 'Total' }
};

interface ChartProps {
  data: Transaction[];
  currencySign: string;
  rate: number;
}

export default function Chart({ data = [], currencySign, rate }: ChartProps) {
  const { lang } = useFinanceStore();
  const t = translations[lang === 'ru' ? 'ru' : 'en'];
  const [view, setView] = useState<'expense' | 'income'>('expense');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const grouped = data
      .filter((t) => t.type === view)
      .reduce((acc: { name: string; value: number }[], t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += Math.abs(Number(t.amount));
        else acc.push({ name: t.category, value: Math.abs(Number(t.amount)) });
        return acc;
      }, []);
    return grouped.sort((a, b) => b.value - a.value);
  }, [data, view]);

  const totalSum = chartData.reduce((acc, item) => acc + item.value, 0);
  const displaySum = currencySign === '₽' ? totalSum : totalSum / rate;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)'
      }}
      className="w-full rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 border mb-8 transition-colors duration-500 select-none"
    >
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{color: 'var(--text-secondary)'}}>
          {view === 'expense' ? t.expense : t.income}
        </h3>
        
        <div style={{backgroundColor: 'var(--bg-button)'}} className="flex p-1.5 rounded-[20px] relative">
          {(['expense', 'income'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => setView(type)}
              style={{color: view === type ? 'var(--text-primary)' : 'var(--text-secondary)'}}
              className="relative px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 z-10"
            >
              {view === type && (
                <motion.div 
                  layoutId="activeChartTab"
                  style={{backgroundColor: 'var(--bg-card)'}}
                  className="absolute inset-0 rounded-xl shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20">{t[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 md:h-64 w-full relative flex flex-col md:flex-row items-center md:items-stretch">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length ? chartData : [{ name: 'Empty', value: 1 }]}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={chartData.length ? 5 : 0}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              cx="50%"
              cy="50%"
              onClick={(entry: any, index: number) => setSelectedIndex(index)}
            >
              {chartData.length ? chartData.map((_, index) => {
                const fill = view === 'expense' ? EXPENSE_COLORS[index % EXPENSE_COLORS.length] : INCOME_COLORS[index % INCOME_COLORS.length];
                const isActive = selectedIndex === index;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    stroke={isActive ? '#00000020' : 'none'}
                    strokeWidth={isActive ? 6 : 0}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                );
              }) : (
                <Cell fill="#f4f4f5" />
              )}
            </Pie>
            
            {/* Tooltip removed to avoid hover-only labels; selection is via click/touch and shows details in the external panel. */}
          </PieChart>
        </ResponsiveContainer>

        {/* Info panel: on md+ show to the right, on mobile show positioned based on segment angle */}
        {/* Info panel: mobile above chart, desktop to the right */}
        {selectedIndex !== null && chartData[selectedIndex] ? (
          (() => {
            const item = chartData[selectedIndex];
            const val = currencySign === '₽' ? item.value : item.value / rate;
            const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
            const color = view === 'expense' ? EXPENSE_COLORS[selectedIndex % EXPENSE_COLORS.length] : INCOME_COLORS[selectedIndex % INCOME_COLORS.length];
            
            return (
              <>
                {/* Mobile version: shows above the chart */}
                <div className="md:hidden w-full mb-4 pointer-events-auto">
                  <div className="flex items-center gap-3 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-zinc-700 shadow-lg">
                    <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase truncate" style={{color: 'var(--text-secondary)'}}>{item.name}</div>
                      <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{val.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySign}</div>
                      <div className="text-[11px] text-gray-500">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop version: positioned to the right */}
                <div className="hidden md:absolute md:right-0 md:top-1/2 md:transform md:-translate-y-1/2 md:w-48 md:ml-4 md:pointer-events-auto">
                  <div className="flex items-center gap-3 bg-white/0 dark:bg-transparent backdrop-blur-none rounded-none p-0">
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color }} />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase truncate" style={{color: 'var(--text-secondary)'}}>{item.name}</div>
                      <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{val.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySign}</div>
                      <div className="text-[11px] text-gray-500">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()
        ) : null}

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + displaySum}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.4em] mb-1" style={{color: 'var(--text-secondary)'}}>
                {t.total}
              </span>
              <p className="text-2xl font-black tracking-tighter" style={{color: view === 'expense' ? 'var(--text-primary)' : '#10b981'}}>
                {displaySum.toLocaleString(undefined, { 
                    minimumFractionDigits: currencySign === '$' ? 2 : 0, 
                    maximumFractionDigits: 2 
                })} {currencySign}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}