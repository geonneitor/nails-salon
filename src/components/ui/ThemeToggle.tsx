'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme based on localStorage
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';
    
    if (isDarkMode) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
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
