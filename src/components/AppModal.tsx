'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export type ModalVariant = 'danger' | 'success' | 'info';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ModalVariant;
  primaryButton: { text: string; onClick: () => void };
  secondaryButton?: { text: string; onClick: () => void };
}

const variantStyles: Record<ModalVariant, { icon: typeof AlertCircle; bg: string; iconColor: string }> = {
  danger: {
    icon: Trash2,
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    iconColor: 'text-green-500',
  },
  info: {
    icon: AlertCircle,
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-500',
  },
};

export default function AppModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  primaryButton,
  secondaryButton,
}: AppModalProps) {
  const { icon: Icon, bg, iconColor } = variantStyles[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-[32px] shadow-2xl border p-6 overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{color: 'var(--text-primary)'}}>{title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{color: 'var(--text-secondary)'}}>{message}</p>
              <div className={`flex gap-3 w-full ${secondaryButton ? '' : 'flex-col'}`}>
                {secondaryButton && (
                  <button
                    type="button"
                    onClick={() => {
                      secondaryButton.onClick();
                      onClose();
                    }}
                    style={{backgroundColor: 'var(--bg-button)', color: 'var(--text-primary)'}}
                    className="flex-1 py-4 rounded-2xl font-bold hover:opacity-80 transition-colors active:scale-[0.98]"
                  >
                    {secondaryButton.text}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    primaryButton.onClick();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] ${
                    variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                      : variant === 'success'
                        ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                  }`}
                >
                  {primaryButton.text}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
