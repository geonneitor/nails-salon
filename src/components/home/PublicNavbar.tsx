'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function PublicNavbar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-0 left-0 w-full z-50 py-6 px-6 md:px-12 flex justify-between items-center"
    >
      {/* Left: Theme Toggle */}
      <div className="flex-1 flex justify-start">
        <ThemeToggle />
      </div>

      {/* Center: Logo */}
      <div className="flex-1 flex justify-center">
        <Link href="/">
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl tracking-widest text-primary leading-none">ZEN</span>
          </div>
        </Link>
      </div>

      {/* Right: Empty spacer to keep logo perfectly centered */}
      <div className="flex-1 flex justify-end">
      </div>
    </motion.nav>
  );
}
