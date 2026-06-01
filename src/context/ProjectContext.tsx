'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  name: string;
  owner_id: string;
};

interface ProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  projects: Project[];
  isLoading: boolean;
  createProject: (name: string) => Promise<Project | null>;
  inviteMember: (projectId: string, email: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', (
        // This is a simplified version; in real Supabase we'd use a view or a join with project_members
        // Assuming a 'project_members' table exists and we filter by the current user
        await supabase.from('project_members').select('project_id').eq('user_id', (await supabase.auth.getUser()).data?.user?.id).then(res => res.data?.map(m => m.project_id) || [])
      ));

    if (!error && data) {
      setProjects(data);
      if (data.length > 0) setActiveProjectState(data[0]);
    }
    setIsLoading(false);
  };

  const createProject = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (error) return null;

    // Also add the owner to project_members
    await supabase.from('project_members').insert({
      project_id: data.id,
      user_id: user.id,
      role: 'admin',
      status: 'active'
    });

    setProjects(prev => [...prev, data]);
    return data;
  };

  const inviteMember = async (projectId: string, email: string) => {
    const { error } = await supabase.from('project_members').insert({
      project_id: projectId,
      email: email,
      role: 'member',
      status: 'pending'
    });
    return !error;
  };

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project);
    localStorage.setItem('active_project_id', project?.id || '');
  };

  return (
    <ProjectContext.Provider value={{
      activeProject,
      setActiveProject,
      projects,
      isLoading,
      createProject,
      inviteMember
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
