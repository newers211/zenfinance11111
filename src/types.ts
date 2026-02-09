export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  type: 'income' | 'expense';
}

export type Period = 'all' | 'day' | 'week' | 'month';
export type Tab = 'all' | 'income' | 'expense';
