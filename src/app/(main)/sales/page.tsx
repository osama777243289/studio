import { SalesForm } from '@/components/sales/sales-form';
import { SalesRecords } from '@/components/sales/sales-records';

export default function SalesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <SalesForm />
      </div>
      <div className="space-y-8">
        <SalesRecords />
      </div>
    </div>
  );
}
