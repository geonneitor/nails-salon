import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeList } from '@/components/settings/EmployeeList';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center py-10 px-6 w-full">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-end mb-8 border-b border-secundario-zen/50 pb-4">
            <h1 className="text-primario-zen font-serif text-3xl uppercase tracking-widest">
              Settings
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-2">
              <h3 className="font-serif text-primario-zen text-xl">General</h3>
              <p className="text-primario-zen/60 text-sm">
                Configuración del equipo y preferencias del estudio.
              </p>
            </div>
            <div className="lg:col-span-2">
              <EmployeeList />
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
