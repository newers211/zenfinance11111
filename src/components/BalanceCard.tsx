'use client'
import { motion } from 'framer-motion';

// Добавляем интерфейс, чтобы TypeScript не ругался
interface BalanceCardProps {
  amount: number;
  title: string;
  currencySign: string;
  rate: number;
}

// ГЛАВНОЕ: export default должен быть здесь
export default function BalanceCard({ amount, title, currencySign, rate }: BalanceCardProps) {
  const displayAmount = currencySign === '₽' ? amount : amount / rate;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)'}}
      className="w-full p-6 md:p-10 rounded-[28px] border shadow-2xl shadow-blue-500/5 relative overflow-hidden transition-all duration-500"
    >
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 md:mb-5 relative z-10" style={{color: 'var(--text-secondary)'}}>
        {title}
      </p>
      
      <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none relative z-10 flex items-baseline gap-2" style={{color: 'var(--text-primary)'}}>
        {displayAmount.toLocaleString(undefined, { 
          minimumFractionDigits: currencySign === '$' ? 2 : 0,
          maximumFractionDigits: 2 
        })}
        <span className="text-2xl md:text-3xl text-blue-600 dark:text-blue-400 font-bold">{currencySign}</span>
      </h2>

      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}