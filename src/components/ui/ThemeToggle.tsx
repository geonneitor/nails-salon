'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ThemeToggle() {
  const { preferences, updatePreference, user } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme based on localStorage or user preferences
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = preferences?.theme === 'zen-dark' || savedTheme === 'dark';
    
    if (isDarkMode) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [preferences?.theme]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      if (user) updatePreference({ theme: 'zen-light' });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      if (user) updatePreference({ theme: 'zen-dark' });
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 md:p-3 flex items-center justify-center rounded-full bg-surface-container-highest/80 backdrop-blur-md shadow-soft-shadow border border-surface-variant transition-all duration-300 hover:scale-105 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Alternar Modo Oscuro/Claro"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
