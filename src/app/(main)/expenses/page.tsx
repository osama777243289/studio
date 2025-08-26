'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';

const expenseCategories = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
];

export default function ExpensesPage() {
  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <TransactionForm
            formTitle="Record New Expense"
            formButtonText="Add Expense"
            categories={expenseCategories}
            transactionType="Expense"
          />
        </CardContent>
      </Card>
    </div>
  );
}
