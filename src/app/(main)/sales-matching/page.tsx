import { MatchingForm } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';

export default function SalesMatchingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <RecordsToMatch />
      </div>
      <div className="space-y-8">
        <MatchingForm />
      </div>
    </div>
  );
}
