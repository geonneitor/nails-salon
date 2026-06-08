import { CustomerList } from '@/components/customers/CustomerList';

export default function CustomersPage() {
  return (
    <div className="flex flex-col items-center py-10 px-6 w-full">
      <div className="w-full max-w-none">
        <div className="flex justify-between items-end mb-8 border-b border-secundario-zen/50 pb-4">
          <h1 className="text-primario-zen font-serif text-3xl uppercase tracking-widest">
            Clientas
          </h1>
        </div>
        <CustomerList />
      </div>
    </div>
  );
}

