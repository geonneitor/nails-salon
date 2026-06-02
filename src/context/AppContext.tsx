'use client';

// ============================================================
// src/context/AppContext.tsx
// Estado global: sesión de usuario, rol de app y proyecto activo.
// Único punto de verdad para "proyecto activo" en la aplicación.
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
  /** Crea un nuevo proyecto (salón). */
  createProject: (name: string) => Promise<Project | null>;
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
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const projectList: Project[] = data ?? [];
        setProjects(projectList);
        if (projectList.length > 0) {
          setActiveProject(projectList[0]);
        }
      });
  }, []);

  const createProject = useCallback(async (name: string): Promise<Project | null> => {
    const { data, error: e } = await supabase
      .from('projects')
      .insert({ name })
      .select()
      .single();

    if (e) {
      console.error('Error creating project:', e);
      return null;
    }

    const newProject = data as Project;
    setProjects((prev) => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
    return newProject;
  }, []);


  useEffect(() => {
    // Resolver la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        loadUserData(authUser).finally(() => setIsLoading(false));
      } else {
        // Sin sesión: caer en modo demo usando NEXT_PUBLIC_PROJECT_ID.
        // Esto permite probar la UI sin haber pasado por Supabase Auth.
        bootDemoFromEnv().finally(() => setIsLoading(false));
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
          // Si el usuario cierra sesión, mantenemos el modo demo con env.
          bootDemoFromEnv();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  /**
   * Carga el proyecto indicado en `NEXT_PUBLIC_PROJECT_ID` y lo marca
   * como `activeProject`. Si no existe, intenta caer al primer proyecto
   * disponible. Solo se usa en modo demo (sin auth).
   */
  const bootDemoFromEnv = useCallback(async () => {
    const envProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
    if (!envProjectId) {
      // Sin env var: intentar al menos cargar la lista de proyectos
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });
      const list: Project[] = data ?? [];
      setProjects(list);
      setActiveProject((prev) => prev ?? list[0] ?? null);
      return;
    }

    // Verificar que el proyecto del env existe
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', envProjectId)
      .single();

    if (!error && project) {
      setProjects([project as Project]);
      setActiveProject((prev) => prev ?? (project as Project));
      setRole('admin'); // demo: permisos de admin
    } else {
      // Env var inválida: fallback al primer proyecto
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });
      const list: Project[] = data ?? [];
      setProjects(list);
      setActiveProject((prev) => prev ?? list[0] ?? null);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ user, role, activeProject, projects, isLoading, setActiveProject, loginDemo, createProject }),
    [user, role, activeProject, projects, isLoading, loginDemo, createProject]

  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ----- Hooks de consumo -----

/**
 * Hook principal para acceder al contexto global de la app.
 * @throws si se usa fuera de <AppProvider>.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>.');
  }
  return ctx;
}

/**
 * Shim de compatibilidad: `useProject` ahora vive sobre `AppContext`.
 * Mantiene el contrato: { activeProject, projects, isLoading, setActiveProject, ... }.
 * Se conservará este nombre por legibilidad en los componentes de UI.
 */
export function useProject() {
  const { activeProject, projects, isLoading, setActiveProject } = useApp();
  return { activeProject, projects, isLoading, setActiveProject };
}
