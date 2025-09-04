
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, HandCoins, Send, Check, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUsers, type User } from '@/lib/firebase/firestore/users';
import { addCashAdvanceRequest, cashAdvanceRequestSchema, getCashAdvanceRequests, type CashAdvanceRequest, updateCashAdvanceRequestStatus } from '@/lib/firebase/firestore/cash-advances';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const getStatusVariant = (status: CashAdvanceRequest['status']) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Approved':
      return 'default';
    case 'Rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

const translateStatus = (status: CashAdvanceRequest['status']) => {
    switch(status) {
        case 'Pending': return 'قيد المراجعة';
        case 'Approved': return 'موافق عليه';
        case 'Rejected': return 'مرفوض';
        default: return status;
    }
}

export default function CashAdvancePage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [requests, setRequests] = useState<CashAdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cashAdvanceRequestSchema>>({
    resolver: zodResolver(cashAdvanceRequestSchema),
    defaultValues: {
      employeeId: '',
      amount: undefined,
      date: new Date(),
      reason: '',
    },
  });
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
        const [fetchedUsers, fetchedRequests] = await Promise.all([
            getUsers(),
            getCashAdvanceRequests(),
        ]);

        const employeeUsers = fetchedUsers.filter(u => u.type === 'employee' && u.employeeAccountId);
        setEmployees(employeeUsers);
        setRequests(fetchedRequests);

    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: 'خطأ', description: 'فشل تحميل بيانات الموظفين أو الطلبات.', variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  async function onSubmit(values: z.infer<typeof cashAdvanceRequestSchema>) {
    const selectedEmployee = employees.find(e => e.id === values.employeeId);
    if (!selectedEmployee) {
        toast({ title: 'خطأ', description: 'لم يتم العثور على الموظف المحدد.', variant: 'destructive'});
        return;
    }

    try {
      await addCashAdvanceRequest(values, selectedEmployee);
      toast({ title: 'نجاح', description: 'تم إرسال طلب السلفة بنجاح.' });
      form.reset();
      fetchAllData(); // Refresh list
    } catch (error: any) {
      console.error('Failed to submit cash advance request:', error);
      toast({ title: 'خطأ', description: 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.', variant: 'destructive'});
    }
  }

  const handleStatusUpdate = async (requestId: string, status: 'Approved' | 'Rejected') => {
      setActionLoading(requestId);
      try {
        await updateCashAdvanceRequestStatus(requestId, status);
        toast({ title: 'نجاح', description: `تم تحديث حالة الطلب إلى "${translateStatus(status)}".`});
        fetchAllData();
      } catch (error) {
        console.error('Failed to update status:', error);
        toast({ title: 'خطأ', description: 'فشل تحديث حالة الطلب.', variant: 'destructive'});
      } finally {
        setActionLoading(null);
      }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <HandCoins className="h-6 w-6" />
            طلب صرف سلفة
          </CardTitle>
          <CardDescription>
            املأ النموذج التالي لتقديم طلب سلفة لموظف.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر موظفًا..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>التاريخ</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className="w-full justify-start text-right font-normal"
                          >
                            {field.value ? format(field.value, 'PPP') : <span>اختر تاريخًا</span>}
                            <CalendarIcon className="mr-2 h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السبب</FormLabel>
                    <FormControl>
                      <Textarea placeholder="اكتب سبب طلب السلفة هنا..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || loading}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                إرسال الطلب
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
                <CardTitle className="font-headline">سجل الطلبات</CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
           </div>
          <CardDescription>
            عرض طلبات السلفة المقدمة مؤخراً.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>الموظف</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراء</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                لا توجد طلبات سلفة.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium">{req.employeeName}</div>
                                    <div className="text-xs text-muted-foreground">{format(req.date.toDate(), 'P')}</div>
                                </TableCell>
                                <TableCell>{req.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(req.status)}>{translateStatus(req.status)}</Badge>
                                </TableCell>
                                <TableCell>
                                    {req.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600" onClick={() => handleStatusUpdate(req.id, 'Approved')} disabled={!!actionLoading}>
                                                {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </Button>
                                             <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleStatusUpdate(req.id, 'Rejected')} disabled={!!actionLoading}>
                                                {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                 </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
