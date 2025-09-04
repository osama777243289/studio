
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertCircle, Check, X, HandCoins, PackageMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCashAdvanceRequestsByStatus, updateCashAdvanceRequestStatus, type CashAdvanceRequest } from '@/lib/firebase/firestore/cash-advances';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function DisbursementApprovalPage() {
  const [cashAdvanceRequests, setCashAdvanceRequests] = useState<CashAdvanceRequest[]>([]);
  const [expenseRequests, setExpenseRequests] = useState([]); // Placeholder for future use
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const pendingCashAdvances = await getCashAdvanceRequestsByStatus('Pending');
      setCashAdvanceRequests(pendingCashAdvances);
      // Fetch expense requests here in the future
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
      toast({ title: 'خطأ', description: 'فشل تحميل الطلبات المعلقة.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async (request: CashAdvanceRequest, status: 'Approved' | 'Rejected') => {
    setActionLoading(request.id);
    try {
      await updateCashAdvanceRequestStatus(request.id, status, request);
      toast({ title: 'نجاح', description: `تم تحديث حالة الطلب بنجاح.` });
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({ title: 'خطأ', description: error.message || 'فشل تحديث حالة الطلب.', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">اعتماد طلبات الصرف</CardTitle>
        <CardDescription>مراجعة واعتماد أو رفض طلبات السلفة والمصروفات المعلقة.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cash-advances" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash-advances">
              <HandCoins className="ml-2 h-4 w-4" />
              طلبات السلفة
            </TabsTrigger>
            <TabsTrigger value="expenses">
                <PackageMinus className="ml-2 h-4 w-4" />
                طلبات المصروفات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cash-advances" className="mt-4">
             <div className="flex justify-end mb-4">
                <Button variant="ghost" size="icon" onClick={fetchRequests} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cashAdvanceRequests.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>لا توجد طلبات سلفة معلقة حاليًا.</p>
                </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead className="text-center">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashAdvanceRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employeeName}</TableCell>
                      <TableCell>{format(req.date.toDate(), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{req.amount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600" onClick={() => handleStatusUpdate(req, 'Approved')} disabled={!!actionLoading}>
                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleStatusUpdate(req, 'Rejected')} disabled={!!actionLoading}>
                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="expenses" className="mt-4">
             <div className="text-center py-16 text-muted-foreground">
                <p>سيتم تطوير واجهة اعتماد المصروفات في مرحلة لاحقة.</p>
             </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
