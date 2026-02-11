'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/store/useStore';
import { translations } from '@/lib/translations';
import { Transaction } from '@/types';

// ПАЛИТРА
const EXPENSE_COLORS = ['#FF4D4D', '#FF6B6B', '#EF233C', '#D90429', '#8D0801', '#F72585', '#B5179E'];
const INCOME_COLORS = ['#00F5D4', '#38BDF8', '#9B5DE5', '#F15BB5', '#FEE440', '#10B981', '#3B82F6'];

interface ChartProps {
  data: Transaction[];
  currencySign: string;
  rate: number;
}

// Кастомный рендер активного сектора — аккуратно "выпрыгивает" наружу
function renderActiveShape(props: any) {
  const RAD = Math.PI / 180;
  const {
    cx, cy, startAngle, endAngle, innerRadius, outerRadius, fill, payload, value
  } = props;

  if (!payload) return null;

  const midAngle = (startAngle + endAngle) / 2;
  const sx = cx + (outerRadius + 12) * Math.cos(-midAngle * RAD);
  const sy = cy + (outerRadius + 12) * Math.sin(-midAngle * RAD);
  
  // Получаем текущую тему
  const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#1f2937';
  const strokeColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={4}
      />
      <circle cx={sx} cy={sy} r={6} fill={fill} opacity={0.95} />
      <text 
        x={sx + (midAngle > 90 && midAngle < 270 ? -8 : 8)} 
        y={sy - 8} 
        textAnchor={midAngle > 90 && midAngle < 270 ? 'end' : 'start'} 
        fontSize={12} 
        fontWeight={700} 
        fill={textColor}
      >
        {payload.name}
      </text>
    </g>
  );
}

export default function Chart({ data = [], currencySign = '₽', rate = 1 }: ChartProps) {
  const { lang } = useFinanceStore();
  const t = translations[lang === 'ru' ? 'ru' : 'en'];

  const [view, setView] = useState<'expense' | 'income'>('expense');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Определяем тему
  const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  // При изменении вкладки закрываем панель деталей с анимацией
  useEffect(() => {
    setSelectedIndex(null);
  }, [view]);

  // Проверка валидности rate
  if (typeof rate !== 'number' || rate <= 0) {
    console.error('Invalid rate:', rate);
    return null;
  }

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const grouped: { name: string; value: number }[] = [];
    data
      .filter(d => d.type === view && d.amount)
      .forEach(d => {
        const amount = Math.abs(Number(d.amount) || 0);
        if (amount > 0) {
          const found = grouped.find(i => i.name === d.category);
          if (found) found.value += amount;
          else grouped.push({ name: d.category || '—', value: amount });
        }
      });
    return grouped.sort((a, b) => b.value - a.value);
  }, [data, view]);

  const total = useMemo(() => chartData.reduce((s, i) => s + i.value, 0), [chartData]);
  const displayTotal = useMemo(() => {
    if (total === 0) return 0;
    return currencySign === '₽' ? total : total / rate;
  }, [total, currencySign, rate]);

  const isSelected = selectedIndex !== null && selectedIndex < chartData.length;
  const selectedItem = isSelected ? chartData[selectedIndex!] : null;

  function handleClick(_: any, index: number) {
    if (selectedIndex === index) setSelectedIndex(null);
    else setSelectedIndex(index);
  }

  // Если нет данных - показываем пустое состояние
  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}}
        className="w-full rounded-[28px] p-6 md:p-8 border shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
            {view === 'expense' ? t.expense : t.income}
          </h3>
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map(type => (
              <button
                key={type}
                onClick={() => setView(type)}
                style={{backgroundColor: view === type ? '#2563eb' : 'var(--bg-button)', color: view === type ? 'white' : 'var(--text-secondary)'}}
                className="relative px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                {type === 'expense' ? t.expense : t.income}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-center justify-center" style={{color: 'var(--text-secondary)'}}>
          <p className="text-sm">{t.empty}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}}
      className="w-full rounded-[28px] p-4 md:p-6 border shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
          {view === 'expense' ? t.expense : t.income}
        </h3>
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map(type => (
            <button
              key={type}
              onClick={() => setView(type)}
              style={{backgroundColor: view === type ? '#2563eb' : 'var(--bg-button)', color: view === type ? 'white' : 'var(--text-secondary)'}}
              className="relative px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              {type === 'expense' ? t.expense : t.income}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-6">
        <motion.div
          layout
          animate={{ x: isSelected ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : -48) : 0, scale: isSelected ? 0.92 : 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          className="w-full md:w-1/2 lg:w-5/12 h-64 flex items-center justify-center relative"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={chartData.length > 1 ? 6 : 0}
                activeShape={renderActiveShape}
                onClick={handleClick}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                cx="50%"
                cy="50%"
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={view === 'expense' ? EXPENSE_COLORS[idx % EXPENSE_COLORS.length] : INCOME_COLORS[idx % INCOME_COLORS.length]}
                    stroke={selectedIndex === idx ? 'rgba(255,255,255,0.2)' : 'transparent'}
                    strokeWidth={selectedIndex === idx ? 6 : 0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Центр: Итого или выбранная категория */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {!isSelected ? (
                <motion.div 
                  key="total" 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }} 
                  className="text-center"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
                    {t.total}
                  </div>
                  <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight" style={{color: 'var(--text-primary)'}}>
                    {displayTotal.toLocaleString(undefined, { minimumFractionDigits: currencySign === '$' ? 2 : 0, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-bold mt-1" style={{color: 'var(--text-secondary)'}}>
                    {currencySign}
                  </div>
                </motion.div>
              ) : selectedItem ? (
                <motion.div 
                  key="selected" 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }} 
                  className="text-center"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
                    {t.categoryLabel}
                  </div>
                  <div className="mt-2 text-lg md:text-xl font-bold tracking-tight" style={{color: 'var(--text-primary)'}}>
                    {selectedItem.name}
                  </div>
                  <div className="text-sm font-bold mt-2" style={{color: 'var(--text-secondary)'}}>
                    {(total > 0 ? (selectedItem.value / total) * 100 : 0).toFixed(1)}%
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Детали справа */}
        <AnimatePresence mode="popLayout">
          {isSelected && selectedItem && (
            <motion.div
              key="details-panel"
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              className="w-full md:w-1/2 lg:w-5/12"
            >
              <motion.div 
                layout 
                style={{backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}
                className="rounded-[24px] border p-5 md:p-6"
              >
                {/* Заголовок с иконкой, названием и кнопкой закрытия */}
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.05,
                      },
                    },
                  }}
                >
                  <motion.div 
                    className="w-5 h-5 rounded-md flex-shrink-0" 
                    style={{ background: view === 'expense' ? EXPENSE_COLORS[selectedIndex! % EXPENSE_COLORS.length] : INCOME_COLORS[selectedIndex! % INCOME_COLORS.length] }}
                    variants={{
                      hidden: { scale: 0, rotate: -180 },
                      visible: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
                    }}
                  />
                  <motion.div 
                    className="flex-1 min-w-0"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200 } },
                    }}
                  >
                    <motion.div 
                      className="text-sm font-bold truncate" 
                      style={{color: 'var(--text-primary)'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {selectedItem.name}
                    </motion.div>
                    <motion.div 
                      className="text-xs mt-1" 
                      style={{color: 'var(--text-secondary)'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {(selectedItem.value).toLocaleString()} {currencySign}
                    </motion.div>
                  </motion.div>
                  <motion.button
                    onClick={() => setSelectedIndex(null)}
                    aria-label="close"
                    className="text-lg font-bold flex-shrink-0 cursor-pointer"
                    style={{color: 'var(--text-secondary)'}}
                    whileHover={{ scale: 1.25, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    ✕
                  </motion.button>
                </motion.div>

                {/* Основной контент */}
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.15,
                      },
                    },
                  }}
                >
                  {/* Прогресс-бар секция */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div 
                      className="text-[11px] font-bold uppercase mb-2" 
                      style={{color: 'var(--text-secondary)'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      {t.shareLabel}
                    </motion.div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{backgroundColor: 'var(--bg-button)'}}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${total > 0 ? (selectedItem.value / total) * 100 : 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
                          className="h-full rounded-full"
                          style={{ background: view === 'expense' ? EXPENSE_COLORS[selectedIndex! % EXPENSE_COLORS.length] : INCOME_COLORS[selectedIndex! % INCOME_COLORS.length] }}
                        />
                      </div>
                      <motion.div 
                        className="w-14 text-right font-bold text-sm tabular-nums" 
                        style={{color: 'var(--text-primary)'}}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      >
                        <motion.span>
                          {(total > 0 ? (selectedItem.value / total) * 100 : 0).toFixed(1)}%
                        </motion.span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Сумма секция */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div 
                      className="text-xs font-bold uppercase mb-1" 
                      style={{color: 'var(--text-secondary)'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {t.sumLabel}
                    </motion.div>
                    <motion.div 
                      className="text-lg font-bold" 
                      style={{color: 'var(--text-primary)'}}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
                    >
                      {(currencySign === '₽' ? selectedItem.value : selectedItem.value / rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                      <motion.span 
                        className="text-xs ml-1" 
                        style={{color: 'var(--text-secondary)'}}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {currencySign}
                      </motion.span>
                    </motion.div>
                  </motion.div>

                  {/* Детали секция */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div 
                      className="text-xs font-bold uppercase mb-1" 
                      style={{color: 'var(--text-secondary)'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      {t.detailsLabel}
                    </motion.div>
                    <motion.div 
                      className="text-sm" 
                      style={{color: 'var(--text-primary)'}}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      {selectedItem.name}
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Разделитель и подсказка */}
                <motion.div 
                  className="mt-4 pt-4 border-t" 
                  style={{borderColor: 'var(--border-primary)'}}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div 
                    className="text-center text-[12px]" 
                    style={{color: 'var(--text-secondary)'}}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
                  >
                    {t.hint}
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
