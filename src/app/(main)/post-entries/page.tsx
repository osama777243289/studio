
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
import { getSalesRecordsByStatus, SalesRecord, postSaleRecord } from '@/lib/firebase/firestore/sales';
import { Loader2, AlertCircle, Send, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function PostEntriesPage() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedRecords = await getSalesRecordsByStatus('Ready for Posting');
        setRecords(fetchedRecords);
      } catch (e: any) {
        console.error("Failed to fetch records:", e);
        setError("فشل تحميل السجلات الجاهزة للترحيل.");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePostRecord = async (recordId: string) => {
    setPostingId(recordId);
    try {
        // In a real scenario, this is where you would generate the journal entries
        // and save them to the transactions collection.
        // For now, we just update the status to 'Posted'.
        await postSaleRecord(recordId);
        toast({
            title: 'تم الترحيل بنجاح',
            description: `تم ترحيل السجل رقم ${recordId} بنجاح.`,
        });
        // Refresh the list
        fetchRecords();
    } catch(e: any) {
        console.error("Failed to post record:", e);
        toast({
            title: 'خطأ في الترحيل',
            description: 'فشلت عملية الترحيل. يرجى المحاولة مرة أخرى.',
            variant: 'destructive',
        });
    } finally {
        setPostingId(null);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">ترحيل القيود</CardTitle>
        <CardDescription>مراجعة وترحيل قيود المبيعات المطابقة إلى اليومية العامة.</CardDescription>
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
                  <TableHead>الفترة</TableHead>
                  <TableHead>الكاشير</TableHead>
                  <TableHead className="text-center">الإجمالي الفعلي</TableHead>
                  <TableHead className="text-center">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد سجلات جاهزة للترحيل حاليًا.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(record.date.toDate(), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{record.period === 'Morning' ? 'صباحية' : 'مسائية'}</TableCell>
                      <TableCell>{record.cashier}</TableCell>
                      <TableCell className="text-center font-mono">
                        {record.actuals ? Object.values(record.actuals).reduce((a,b) => a + b, 0).toFixed(2) : record.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                            size="sm"
                            onClick={() => handlePostRecord(record.id)}
                            disabled={postingId === record.id}
                        >
                            {postingId === record.id ? (
                                <>
                                 <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                 جاري الترحيل...
                                </>
                            ) : (
                                <>
                                 <Send className="ml-2 h-4 w-4" />
                                 ترحيل القيد
                                </>
                            )}
                           
                        </Button>
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
