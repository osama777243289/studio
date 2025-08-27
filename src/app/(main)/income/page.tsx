'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';

const incomeCategories = [
  { value: 'salary', label: 'راتب' },
  { value: 'sales', label: 'مبيعات' },
  { value: 'freelance', label: 'عمل حر' },
  { value: 'investment', label: 'استثمار' },
  { value: 'other', label: 'أخرى' },
];

export default function IncomePage() {
  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <TransactionForm
            formTitle="تسجيل دخل جديد"
            formButtonText="إضافة الدخل"
            categories={incomeCategories}
            transactionType="Income"
          />
        </CardContent>
      </Card>
    </div>
  );
}
