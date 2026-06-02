'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Scissors, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Clientas', href: '/customers', icon: Users },
  { label: 'Servicios', href: '/services', icon: Scissors },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeProject, projects, setActiveProject } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="w-64 h-screen bg-[#FDFBEE] border-r border-secundario-zen/50 flex flex-col justify-between py-8 px-6 hidden md:flex sticky top-0">

      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-primario-zen font-serif text-4xl tracking-[0.2em] ml-[0.2em]">
            ZEN
          </h1>
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-primario-zen/80"></span>
            ))}
          </div>
        </div>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secundario-zen/30 text-primario-zen text-xs font-medium hover:bg-secundario-zen/50 transition-all border border-secundario-zen/60 shadow-sm"
          >
            <span className="truncate">
              {activeProject ? activeProject.name : 'Seleccionar Salón'}
            </span_ la de la derecha es la que manda
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full mt-2 bg-fondo-zen border border-secundario-zen/50 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="py-2 max-h-60 overflow-y-auto">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setActiveProject(project);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          activeProject?.id === project.id
                            ? 'bg-primario-zen text-fondo-zen font-semibold'
                            : 'text-primario-zen/60 hover:bg-secundario-zen/40 hover:text-primario-zen'
                        }`}
                      >
                        {project.name}
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-xs text-primario-zen/40 italic">
                      No hay proyectos disponibles.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primario-zen text-fondo-zen shadow-sm'
                    : 'text-primario-zen/60 hover:bg-secundario-zen/30 hover:text-primario-zen'
                }`}
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
                <span className={`text-sm tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-secundario-zen/50">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-primario-zen/60 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-300">
          <LogOut strokeWidth={2} className="w-5 h-5" />
          <span className="text-sm tracking-wide font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
