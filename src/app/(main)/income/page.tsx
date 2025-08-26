'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';

const incomeCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'sales', label: 'Sales' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

export default function IncomePage() {
  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <TransactionForm
            formTitle="Record New Income"
            formButtonText="Add Income"
            categories={incomeCategories}
            transactionType="Income"
          />
        </CardContent>
      </Card>
    </div>
  );
}
