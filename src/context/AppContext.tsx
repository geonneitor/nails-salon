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
import type { AppRole, Project, UserPreferences } from '@/types/supabase';

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
  /** Preferencias personalizadas del usuario. */
  preferences: UserPreferences | null;
  /** Indica si el contexto todavía está resolviendo la sesión inicial. */
  isLoading: boolean;
  /** Cambia el proyecto activo. */
  setActiveProject: (project: Project) => void;
  /** Crea un nuevo proyecto (salón). */
  createProject: (name: string) => Promise<Project | null>;
  /** Sincroniza y actualiza la lista de proyectos desde la base de datos. */
  refreshProjects: () => Promise<void>;
  /** Actualiza una preferencia específica del usuario. */
  updatePreference: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'updated_at'>>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ----- Provider -----

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Función dedicada a refrescar la lista de proyectos en tiempo real */
  const fetchProjects = useCallback(async () => {
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

  /** Carga el rol y los proyectos disponibles para el usuario dado. */
  const loadUserData = useCallback(async (authUser: User) => {
    // 1. Obtener rol de la tabla user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    setRole((roleData?.role as AppRole) ?? null);

    // 2. Obtener proyectos accesibles mediante la función modularizada
    await fetchProjects();

    // 3. Obtener preferencias del usuario
    const { data: prefData, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', authUser.id)
      .limit(1);

    if (prefError) {
      console.error('Error loading preferences:', prefError);
    } else {
      const currentPref = prefData?.[0] as UserPreferences | null;
      if (currentPref) {
        setPreferences(currentPref);
      } else {
        // Crear preferencias por defecto si no existen
        const { data: defaultPref, error: upsertError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: authUser.id,
            theme: 'zen-light',
            density: 'comfortable',
            sidebar_collapsed: false,
            default_view: 'day'
          })
          .select()
          .limit(1);

        if (upsertError) {
          console.error('Error creating default preferences:', upsertError);
        } else {
          setPreferences((defaultPref?.[0] as UserPreferences) ?? null);
        }
      }
    }
  }, [fetchProjects]);

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
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Session recovery error:', error.message);

        // Si el error es específicamente de Refresh Token, forzamos el cierre de sesión
        if (error.message.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
        }

        setUser(null);
        setRole(null);
        setProjects([]);
        setActiveProject(null);
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        loadUserData(authUser).finally(() => setIsLoading(false));
      } else {
        setRole(null);
        setProjects([]);
        setActiveProject(null);
        setPreferences(null);
        setIsLoading(false);
      }
    }).catch(async err => {
      console.error('Critical auth error:', err);
      try {
        await supabase.auth.signOut();
      } catch (e) { }
      setIsLoading(false);
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
          setPreferences(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ----- Funciones de Preferencias -----

  const updatePreference = useCallback(async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'updated_at'>>) => {
    if (!user) return;

    setPreferences((prev) => (prev ? { ...prev, ...updates } : null));

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating preference:', error);
    }
  }, [user]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      role,
      activeProject,
      projects,
      preferences,
      isLoading,
      setActiveProject,
      createProject,
      refreshProjects: fetchProjects,
      updatePreference
    }),
    [user, role, activeProject, projects, preferences, isLoading, createProject, fetchProjects, updatePreference]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ----- Hooks de consumo -----

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>.');
  }
  return ctx;
}

export function useProject() {
  const { activeProject, projects, isLoading, setActiveProject } = useApp();
  return { activeProject, projects, isLoading, setActiveProject };
}