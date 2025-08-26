'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';

const expenseCategories = [
  { value: 'rent', label: 'إيجار' },
  { value: 'utilities', label: 'خدمات' },
  { value: 'groceries', label: 'بقالة' },
  { value: 'transportation', label: 'مواصلات' },
  { value: 'supplies', label: 'لوازم' },
  { value: 'other', label: 'أخرى' },
];

export default function ExpensesPage() {
  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <TransactionForm
            formTitle="تسجيل مصروف جديد"
            formButtonText="إضافة مصروف"
            categories={expenseCategories}
            transactionType="Expense"
          />
        </CardContent>
      </Card>
    </div>
  );
}
