
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllTransactions, TransactionWithAccountName } from '@/lib/firebase/firestore/transactions';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function GeneralJournalPage() {
  const [transactions, setTransactions] = useState<TransactionWithAccountName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTransactions = await getAllTransactions();
        setTransactions(fetchedTransactions);
      } catch (e: any) {
        console.error("Failed to fetch transactions:", e);
        setError("فشل تحميل اليومية العامة. يرجى التحقق من اتصالك وإعدادات Firestore.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">اليومية العامة</CardTitle>
        <CardDescription>سجل زمني لجميع المعاملات المالية المسجلة في النظام.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ في التحميل</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>رقم القيد</TableHead>
                  <TableHead>الحساب</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-center">مدين</TableHead>
                  <TableHead className="text-center">دائن</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لم يتم العثور على أي معاملات.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(tx.date.toDate(), 'yyyy/MM/dd')}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                      <TableCell>{tx.accountName}</TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell className="text-center font-mono">
                        {tx.type === 'Expense' ? formatCurrency(tx.amount) : formatCurrency(0)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {tx.type === 'Income' ? formatCurrency(tx.amount) : formatCurrency(0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
