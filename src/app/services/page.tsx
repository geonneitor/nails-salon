import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceList } from '@/components/services/ServiceList';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center py-10 px-6 w-full">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-end mb-8 border-b border-secundario-zen/50 pb-4">
            <h1 className="text-primario-zen font-serif text-3xl uppercase tracking-widest">
              Services
            </h1>
          </div>
          <ServiceList />
        </div>
      </div>
    </DashboardLayout>
  );
}
