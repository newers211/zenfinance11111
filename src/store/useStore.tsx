import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Category } from '@/types';

// Описание структуры хранилища
interface FinanceStore {
  // Данные
  transactions: Transaction[];
  categories: Category[];
  
  // Настройки интерфейса
  theme: 'light' | 'dark';
  lang: 'ru' | 'en';
  
  // Логика валюты
  currency: 'RUB' | 'USD';
  rate: number;

  // Методы для обновления данных
  setTransactions: (t: Transaction[]) => void;
  addTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;
  setCategories: (c: Category[]) => void;
  
  // Методы для настроек
  setTheme: (t: 'light' | 'dark') => void;
  setLang: (l: 'ru' | 'en') => void;
  setCurrency: (c: 'RUB' | 'USD') => void;
  setRate: (r: number) => void;

  // Очистить данные пользователя при выходе (чтобы другой пользователь не видел чужие данные)
  clearUserData: () => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      // Начальные состояния
      transactions: [],
      categories: [],
      theme: 'dark', // По умолчанию темная тема
      lang: 'ru',
      currency: 'RUB',
      rate: 90,

      // Реализация методов
      setTransactions: (t) => set({ transactions: t }),

      addTransaction: (t) => set((state) => ({ 
        transactions: [t, ...state.transactions] 
      })),

      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      })),

      setCategories: (c) => set({ categories: c }),
      
      setTheme: (t) => set({ theme: t }),
      setLang: (l) => set({ lang: l }),
      
      setCurrency: (c) => set({ currency: c }),
      setRate: (r) => set({ rate: r }),

      clearUserData: () => set({ transactions: [], categories: [] }),
    }),
    { 
      name: 'zen-finance-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);