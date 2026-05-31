'use client';

// ============================================================
// src/context/AppContext.tsx
// Estado global: sesión de usuario, rol de app y proyecto activo.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { AppRole, Project } from '@/types/supabase';

// ----- Tipos del contexto -----

interface AppContextValue {
  /** Usuario autenticado de Supabase Auth, o null si no hay sesión. */
  user: User | null;
  /** Rol de la app ('admin' | 'employee'), derivado de public.user_roles. */
  role: AppRole | null;
  /** Proyecto (salón/sucursal) activo seleccionado por el usuario. */
  activeProject: Project | null;
  /** Lista de proyectos a los que tiene acceso el usuario autenticado. */
  projects: Project[];
  /** Indica si el contexto todavía está resolviendo la sesión inicial. */
  isLoading: boolean;
  /** Cambia el proyecto activo. */
  setActiveProject: (project: Project) => void;
  /** Inicia una sesión de demo sin requerir credenciales. */
  loginDemo: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ----- Provider -----

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Carga el rol y los proyectos disponibles para el usuario dado. */
  const loadUserData = useCallback(async (authUser: User) => {
    // 1. Obtener rol de la tabla user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    setRole((roleData?.role as AppRole) ?? null);

    // 2. Obtener proyectos accesibles (todos los autenticados pueden leer projects, según policy)
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    const projectList: Project[] = projectsData ?? [];
    setProjects(projectList);

    // Seleccionar el primer proyecto por defecto si no hay ninguno activo
    if (projectList.length > 0) {
      setActiveProject((prev) => prev ?? projectList[0]);
    }
  }, []);

  const loginDemo = useCallback(() => {
    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@zen.com',
    } as User;

    setUser(mockUser);
    setRole('admin');

    // Cargar proyectos y asignar el primero
    supabase.from('projects').select('*').order('created_at', { ascending: true }).then(({ data }) => {
      const projectList = data ?? [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setActiveProject(projectList[0]);
      }
    });
  }, []);

  useEffect(() => {
    // Resolver la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        loadUserData(authUser).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Suscripción reactiva a cambios de sesión (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);
        if (authUser) {
          loadUserData(authUser);
        } else {
          setRole(null);
          setProjects([]);
          setActiveProject(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const value = useMemo<AppContextValue>(
    () => ({ user, role, activeProject, projects, isLoading, setActiveProject, loginDemo }),
    [user, role, activeProject, projects, isLoading, loginDemo]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ----- Hook de consumo -----

/**
 * Hook para acceder al contexto global de la app.
 * @throws si se usa fuera de <AppProvider>.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>.');
  }
  return ctx;
}
