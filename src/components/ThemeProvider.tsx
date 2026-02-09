'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useFinanceStore((s) => s.theme);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    console.log('🎨 Theme set to:', theme, 'Attribute:', html.getAttribute('data-theme'));
  }, [theme]);

  return <>{children}</>;
}
