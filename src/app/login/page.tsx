'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import AppModal from '@/components/AppModal';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'success' | 'info';
  primaryText: string;
  onPrimary: () => void;
};

const emptyModal: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'info',
  primaryText: 'OK',
  onPrimary: () => {},
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(emptyModal);
  const router = useRouter();

  const closeModal = () => setModal(emptyModal);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setModal({
          open: true,
          title: 'Ошибка входа',
          message: error.message,
          variant: 'info',
          primaryText: 'Понятно',
          onPrimary: closeModal,
        });
      } else router.push('/');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setModal({
          open: true,
          title: 'Ошибка регистрации',
          message: error.message,
          variant: 'info',
          primaryText: 'Понятно',
          onPrimary: closeModal,
        });
      } else {
        setModal({
          open: true,
          title: 'Аккаунт создан!',
          message: 'Теперь войдите в аккаунт.',
          variant: 'success',
          primaryText: 'Войти в аккаунт',
          onPrimary: () => {
            closeModal();
            setIsLogin(true);
          },
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-black flex items-center justify-center p-6 text-slate-900 dark:text-white">
      <motion.div
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-2xl border border-zinc-100 dark:border-zinc-800"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter">ZenFinance</h1>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            {isLogin ? 'С возвращением' : 'Создай аккаунт'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase ml-4 text-zinc-400">Email</p>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 border border-transparent focus:border-blue-500 transition-all font-medium"
              placeholder="name@mail.com"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase ml-4 text-zinc-400">Пароль</p>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 border border-transparent focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-4"
          >
            {loading ? (
              'Секунду...'
            ) : isLogin ? (
              <span className="inline-flex items-center gap-2"><LogIn size={20} /> Войти</span>
            ) : (
              <span className="inline-flex items-center gap-2"><UserPlus size={20} /> Регистрация</span>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-xs font-bold text-zinc-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
        >
          {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </button>
      </motion.div>

      <AppModal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        primaryButton={{ text: modal.primaryText, onClick: modal.onPrimary }}
      />
    </div>
  );
}