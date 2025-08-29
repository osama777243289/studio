
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
import { Badge } from '@/components/ui/badge';
import { Group, group } from 'console';

interface GroupedTransaction {
    journalId: string;
    date: Date;
    description: string;
    entries: TransactionWithAccountName[];
}

export default function GeneralJournalPage() {
  const [transactions, setTransactions] = useState<TransactionWithAccountName[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTransactions = await getAllTransactions();
        setTransactions(fetchedTransactions);

        const grouped = fetchedTransactions.reduce((acc, tx) => {
            const journalId = tx.journalId || tx.id;
            if (!acc[journalId]) {
                acc[journalId] = {
                    journalId: journalId,
                    date: tx.date.toDate(),
                    description: tx.description || 'معاملة فردية',
                    entries: []
                };
            }
            acc[journalId].entries.push(tx);
            return acc;
        }, {} as Record<string, GroupedTransaction>);

        setGroupedTransactions(Object.values(grouped));

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

  const isCredit = (amount: number) => amount < 0;

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
                  <TableHead>الحساب</TableHead>
                  <TableHead className="text-center">مدين</TableHead>
                  <TableHead className="text-center">دائن</TableHead>
                  <TableHead>الوصف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لم يتم العثور على أي معاملات.
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedTransactions.map((group) => (
                    group.entries.map((tx, index) => (
                         <TableRow key={tx.id} className={index === group.entries.length - 1 ? 'border-b-4 border-b-primary/20' : ''}>
                             {index === 0 && (
                                <TableCell rowSpan={group.entries.length} className="align-top">
                                    <div className="flex flex-col">
                                        <span>{format(group.date, 'yyyy/MM/dd')}</span>
                                        <Badge variant="outline" className="mt-1 w-fit">{group.journalId.substring(0,8)}</Badge>
                                    </div>
                                </TableCell>
                             )}
                            <TableCell className={`font-medium ${isCredit(tx.amount) ? 'pr-8' : ''}`}>{tx.accountName}</TableCell>
                            <TableCell className="text-center font-mono">
                                {!isCredit(tx.amount) ? formatCurrency(tx.amount) : formatCurrency(0)}
                            </TableCell>
                            <TableCell className="text-center font-mono text-red-600">
                                {isCredit(tx.amount) ? formatCurrency(Math.abs(tx.amount)) : formatCurrency(0)}
                            </TableCell>
                             {index === 0 && (
                                <TableCell rowSpan={group.entries.length} className="text-muted-foreground align-top">{group.description}</TableCell>
                             )}
                        </TableRow>
                    ))
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
