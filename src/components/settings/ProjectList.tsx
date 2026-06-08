'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Project } from '@/types/supabase';
import { supabase } from '@/lib/supabaseClient';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase } from 'lucide-react';

function ProjectItem({
  project,
  isActive,
  onSelect,
  onDelete
}: {
  project: Project;
  isActive: boolean;
  onSelect: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? 'bg-primario-zen text-fondo-zen border-primario-zen shadow-md'
          : 'bg-surface-container-lowest text-primario-zen border-secundario-zen/50 hover:border-primario-zen/50'
      }`}
      onClick={() => onSelect(project)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isActive ? 'border-fondo-zen bg-fondo-zen' : 'border-primario-zen/40'
        }`}>
          {isActive && <Check className="w-3 h-3 text-primario-zen" />}
        </div>
        <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
          {project.name}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        className="p-2 rounded-lg text-on-surface-variant/30 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProjectList() {
  const { projects, activeProject, setActiveProject, createProject, refreshProjects } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsLoading(true);
    setError(null);

    const project = await createProject(projectName.trim());
    if (project) {
      setActiveProject(project);
      setProjectName('');
      setIsAdding(false);
      toast.success('Proyecto creado', `"${project.name}" está listo para usar.`);
    } else {
      setError('No se pudo crear el proyecto.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    // FIXED: useConfirm() en vez de confirm() nativo
    const project = projects.find(p => p.id === id);
    const ok = await confirm({
      title: '¿Eliminar proyecto?',
      message: `Esta acción eliminará "${project?.name ?? 'este proyecto'}" de forma permanente y no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
      danger: true,
    });
    if (!ok) return;

    setIsLoading(true);
    const { error: e } = await supabase.from('projects').delete().eq('id', id);
    if (e) {
      console.error('Error deleting project:', e);
      toast.error('Error al eliminar', 'No fue posible eliminar el proyecto. Intenta de nuevo.');
    } else {
      // refreshProjects() actualiza la lista desde Supabase sin recargar la página
      await refreshProjects();
      toast.success('Proyecto eliminado', 'El proyecto fue eliminado correctamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-primario-zen text-xl">Proyectos (Salones)</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primario-zen hover:underline transition-all"
        >
          <Plus className="w-4 h-4" /> Añadir Proyecto
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-secundario-zen/20 rounded-3xl border border-secundario-zen/50"
          >
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-primario-zen/50">
                  Nombre del Salón
                </label>
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-fondo-zen border border-secundario-zen/60 text-primario-zen text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario-zen/30"
                  placeholder="Ej. Zen Nail Studio Central"
                />
              </div>
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setProjectName(''); setError(null); }}
                  className="px-4 py-2 text-xs font-medium text-primario-zen/60 hover:text-primario-zen"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primario-zen text-fondo-zen px-6 py-2 rounded-full uppercase tracking-widest text-xs font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primario-zen/50" /></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.length > 0 ? (
          projects.map(project => (
            <ProjectItem
              key={project.id}
              project={project}
              isActive={activeProject?.id === project.id}
              onSelect={setActiveProject}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState
            icon={Briefcase}
            title="Sin proyectos"
            description="Crea un proyecto para empezar a gestionar tu salón, clientas y servicios."
            action={{ label: '+ Nuevo Proyecto', onClick: () => setIsAdding(true) }}
          />
        )}
      </div>
    </div>
  );
}
