
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
import { getSalesRecordsByStatus, SalesRecord, postSaleRecord, unpostSaleRecord } from '@/lib/firebase/firestore/sales';
import { Loader2, AlertCircle, Send, CheckCheck, Undo2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const translateStatus = (status: 'Pending Upload' | 'Pending Matching' | 'Ready for Posting' | 'Posted') => {
    switch (status) {
        case 'Pending Upload': return 'قيد الرفع';
        case 'Pending Matching': return 'قيد المطابقة';
        case 'Ready for Posting': return 'جاهز للترحيل';
        case 'Posted': return 'مُرحّل';
        default: return status;
    }
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'جاهز للترحيل': return 'default';
        case 'مُرحّل': return 'secondary';
        default: return 'outline';
    }
}

export default function PostEntriesPage() {
  const [readyRecords, setReadyRecords] = useState<SalesRecord[]>([]);
  const [postedRecords, setPostedRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [unpostingId, setUnpostingId] = useState<string | null>(null);
  const [costs, setCosts] = useState<{ [key: string]: number | string }>({});
  const { toast } = useToast();

  const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedReadyRecords, fetchedPostedRecords] = await Promise.all([
             getSalesRecordsByStatus('Ready for Posting'),
             getSalesRecordsByStatus('Posted')
        ]);
        setReadyRecords(fetchedReadyRecords);
        setPostedRecords(fetchedPostedRecords);

      } catch (e: any) {
        console.error("Failed to fetch records:", e);
        setError("فشل تحميل السجلات. يرجى التحقق من اتصالك وإعدادات Firestore.");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchRecords();
  }, []);
  
  const handleCostChange = (recordId: string, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
        setCosts(prev => ({...prev, [recordId]: value}));
    }
  };

  const handlePostRecord = async (recordId: string) => {
    setPostingId(recordId);
    const costOfSales = parseFloat(costs[recordId] as string);

    if (isNaN(costOfSales) || costOfSales < 0) {
        toast({
            title: 'خطأ في الإدخال',
            description: 'الرجاء إدخال قيمة صالحة لتكلفة المبيعات.',
            variant: 'destructive',
        });
        setPostingId(null);
        return;
    }

    try {
        await postSaleRecord(recordId, costOfSales);
        toast({
            title: 'تم الترحيل بنجاح',
            description: `تم ترحيل السجل رقم ${recordId} بنجاح.`,
        });
        fetchRecords(); // Refresh both lists
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

   const handleUnpostRecord = async (recordId: string) => {
    setUnpostingId(recordId);
    try {
        await unpostSaleRecord(recordId);
        toast({
            title: 'تم إلغاء الترحيل',
            description: `تمت إعادة السجل ${recordId} إلى حالة "جاهز للترحيل".`,
        });
        fetchRecords();
    } catch(e: any) {
        console.error("Failed to unpost record:", e);
        toast({
            title: 'خطأ في إلغاء الترحيل',
            description: e.message || 'فشلت عملية إلغاء الترحيل. يرجى المحاولة مرة أخرى.',
            variant: 'destructive',
        });
    } finally {
        setUnpostingId(null);
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">السجلات الجاهزة للترحيل</CardTitle>
          </div>
          <CardDescription>مراجعة وترحيل قيود المبيعات المطابقة إلى اليومية العامة بعد إدخال تكلفة المبيعات.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
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
                    <TableHead className="w-[200px]">تكلفة المبيعات</TableHead>
                    <TableHead className="text-center">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readyRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        لا توجد سجلات جاهزة للترحيل حاليًا.
                      </TableCell>
                    </TableRow>
                  ) : (
                    readyRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(record.date.toDate(), 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{record.period === 'Morning' ? 'صباحية' : 'مسائية'}</TableCell>
                        <TableCell>{record.cashier}</TableCell>
                        <TableCell className="text-center font-mono">
                          {record.actuals ? Object.values(record.actuals).reduce((a,b) => a + b, 0).toFixed(2) : record.total.toFixed(2)}
                        </TableCell>
                         <TableCell>
                            <Input 
                              type="number"
                              placeholder="أدخل تكلفة المبيعات"
                              value={costs[record.id] || ''}
                              onChange={(e) => handleCostChange(record.id, e.target.value)}
                              className="text-center"
                            />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                              size="sm"
                              onClick={() => handlePostRecord(record.id)}
                              disabled={postingId === record.id || !costs[record.id] || unpostingId !== null}
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

      <Card>
        <CardHeader>
           <div className="flex items-center gap-2">
            <CheckCheck className="h-6 w-6 text-green-600" />
            <CardTitle className="font-headline">السجلات المُرحّلة</CardTitle>
          </div>
          <CardDescription>عرض السجلات التي تم ترحيلها بنجاح إلى اليومية العامة.</CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
           ) : (
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>التاريخ</TableHead>
                       <TableHead>الكاشير</TableHead>
                       <TableHead className="text-center">تكلفة المبيعات</TableHead>
                       <TableHead className="text-center">الحالة</TableHead>
                       <TableHead className="text-center">الإجراء</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {postedRecords.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                           لا توجد سجلات مُرحّلة.
                         </TableCell>
                       </TableRow>
                     ) : (
                       postedRecords.map((record) => (
                         <TableRow key={record.id}>
                           <TableCell>{format(record.date.toDate(), 'yyyy/MM/dd')} - {record.period === 'Morning' ? 'صباحية' : 'مسائية'}</TableCell>
                           <TableCell>{record.cashier}</TableCell>
                           <TableCell className="text-center font-mono">
                               {record.costOfSales?.toFixed(2) || 'N/A'}
                           </TableCell>
                           <TableCell className="text-center">
                               <Badge variant={getStatusVariant(translateStatus(record.status))} className="bg-blue-100 text-blue-800">
                                   {translateStatus(record.status)}
                               </Badge>
                           </TableCell>
                           <TableCell className="text-center">
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUnpostRecord(record.id)}
                                  disabled={unpostingId === record.id || postingId !== null}
                               >
                                 {unpostingId === record.id ? (
                                    <>
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                        جاري الإلغاء...
                                    </>
                                 ) : (
                                    <>
                                        <Undo2 className="ml-2 h-4 w-4" />
                                        إلغاء الترحيل
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
    </div>
  );
}
