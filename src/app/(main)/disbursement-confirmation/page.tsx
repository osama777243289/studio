
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, AlertCircle, DollarSign, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    getCashAdvanceRequestsByStatus, 
    confirmCashAdvanceDisbursement,
    type CashAdvanceRequest 
} from '@/lib/firebase/firestore/cash-advances';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Account, getAccounts } from '@/lib/firebase/firestore/accounts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DisbursementFormData {
  [requestId: string]: {
    actualAmount: string;
    notes: string;
    disbursingAccountId: string;
  };
}

export default function DisbursementConfirmationPage() {
  const [approvedRequests, setApprovedRequests] = useState<CashAdvanceRequest[]>([]);
  const [cashAndBankAccounts, setCashAndBankAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<DisbursementFormData>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequiredData = useCallback(async () => {
    setLoading(true);
    try {
      const [requests, accounts] = await Promise.all([
        getCashAdvanceRequestsByStatus('Approved'),
        getAccounts(),
      ]);

      const findCashAndBankAccounts = (accs: Account[]): Account[] => {
          let results: Account[] = [];
          for (const acc of accs) {
              if (acc.classifications?.includes('صندوق') || acc.classifications?.includes('بنك')) {
                  results.push(acc);
              }
              if (acc.children) {
                  results = [...results, ...findCashAndBankAccounts(acc.children)];
              }
          }
          return results;
      };

      setApprovedRequests(requests);
      setCashAndBankAccounts(findCashAndBankAccounts(accounts));
      
      const initialFormData: DisbursementFormData = {};
      requests.forEach(req => {
        initialFormData[req.id] = {
            actualAmount: req.amount.toString(),
            notes: '',
            disbursingAccountId: ''
        };
      });
      setFormData(initialFormData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: 'خطأ', description: 'فشل تحميل الطلبات المعتمدة.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequiredData();
  }, [fetchRequiredData]);

  const handleInputChange = (requestId: string, field: keyof DisbursementFormData[string], value: string) => {
    setFormData(prev => ({
        ...prev,
        [requestId]: {
            ...prev[requestId],
            [field]: value
        }
    }));
  };

  const handleConfirmDisbursement = async (request: CashAdvanceRequest) => {
    const { actualAmount, notes, disbursingAccountId } = formData[request.id];
    const amount = parseFloat(actualAmount);

    if (isNaN(amount) || amount <= 0) {
        toast({ title: 'خطأ', description: 'الرجاء إدخال مبلغ منصرف صالح.', variant: 'destructive'});
        return;
    }
    if (!disbursingAccountId) {
        toast({ title: 'خطأ', description: 'الرجاء تحديد حساب الصرف (الصندوق أو البنك).', variant: 'destructive'});
        return;
    }

    setProcessingId(request.id);
    try {
        await confirmCashAdvanceDisbursement({
            request,
            actualAmount: amount,
            notes,
            disbursingAccountId
        });
        toast({ title: 'نجاح', description: 'تم تأكيد الصرف وإنشاء القيد بنجاح.'});
        fetchRequiredData(); // Refresh the list
    } catch (error: any) {
        console.error('Failed to confirm disbursement:', error);
        toast({ title: 'خطأ', description: error.message || 'فشل تأكيد الصرف.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">تأكيد عمليات الصرف</CardTitle>
            </div>
             <Button variant="ghost" size="icon" onClick={fetchRequiredData} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
        </div>
        <CardDescription>مراجعة الطلبات المعتمدة وتأكيد صرف المبالغ من الصندوق وإنشاء القيود المحاسبية.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : approvedRequests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>لا توجد طلبات معتمدة بانتظار الصرف حاليًا.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف / التاريخ</TableHead>
                  <TableHead>المبلغ المطلوب</TableHead>
                  <TableHead>السبب</TableHead>
                  <TableHead className="w-[150px]">المبلغ المنصرف</TableHead>
                  <TableHead className="w-[200px]">حساب الصرف</TableHead>
                  <TableHead className="w-[200px]">ملاحظات</TableHead>
                  <TableHead className="text-center">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>
                        <div className="font-medium">{req.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{format(req.date.toDate(), 'yyyy/MM/dd')}</div>
                    </TableCell>
                    <TableCell className="font-mono">{req.amount.toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                    <TableCell>
                        <Input 
                            type="number"
                            value={formData[req.id]?.actualAmount || ''}
                            onChange={(e) => handleInputChange(req.id, 'actualAmount', e.target.value)}
                            className="text-center"
                        />
                    </TableCell>
                    <TableCell>
                        <Select
                            value={formData[req.id]?.disbursingAccountId || ''}
                            onValueChange={(value) => handleInputChange(req.id, 'disbursingAccountId', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر حساب..." />
                            </SelectTrigger>
                            <SelectContent>
                                {cashAndBankAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell>
                        <Textarea 
                            value={formData[req.id]?.notes || ''}
                            onChange={(e) => handleInputChange(req.id, 'notes', e.target.value)}
                            rows={1}
                        />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirmDisbursement(req)} 
                        disabled={processingId === req.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === req.id ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
                        تأكيد الصرف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
