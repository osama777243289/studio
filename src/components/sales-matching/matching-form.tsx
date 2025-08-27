
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, Coins, Receipt, Wallet, CreditCard, BookUser, MessageSquare, Ban, Save, Info, MinusCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { SalesRecord, AccountDetail } from '@/lib/firebase/firestore/sales';

interface MatchingFormProps {
    record: SalesRecord | null;
}

interface ActualAmounts {
    [key: string]: number | string;
}

export function MatchingForm({ record }: MatchingFormProps) {
  const [actuals, setActuals] = useState<ActualAmounts>({});

  useEffect(() => {
    // Reset values when record changes
    setActuals({});
  }, [record]);


  if (!record) {
    return (
        <Card>
             <CardHeader>
                <div className="flex items-center gap-2">
                <FileCheck className="h-6 w-6" />
                <CardTitle>مطابقة المبيعات</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>لم يتم تحديد سجل</AlertTitle>
                    <AlertDescription>
                        الرجاء تحديد سجل من قائمة "السجلات قيد المطابقة" للبدء.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
  }

  const handleActualChange = (key: string, value: string) => {
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
        setActuals(prev => ({...prev, [key]: value}));
    }
  }

  const handleFocus = (key: string) => {
    const value = actuals[key];
    if (parseFloat(value as string) === 0) {
      setActuals(prev => ({...prev, [key]: ''}));
    }
  }
  
  const getNumericValue = (key: string) => {
      const value = actuals[key];
      if (typeof value === 'string' && value.endsWith('.')) {
        return parseFloat(value.slice(0, -1)) || 0;
      }
      return parseFloat(value as string) || 0;
  }

  const registeredCash = record.cash?.amount || 0;
  const registeredCards = record.cards.reduce((sum, acc) => sum + acc.amount, 0);
  const registeredCredits = record.credits.reduce((sum, acc) => sum + acc.amount, 0);
  const totalRegistered = record.total;
  
  const actualCash = getNumericValue('cash');
  const actualCards = record.cards.reduce((sum, acc, i) => sum + getNumericValue(`card-${i}`), 0);
  const actualCredits = record.credits.reduce((sum, acc, i) => sum + getNumericValue(`credit-${i}`), 0);
  const totalActual = actualCash + actualCards + actualCredits;

  const totalDifference = totalActual - totalRegistered;
  
  const renderMatchingRow = (label: string, registeredAmount: number, actualKey: string) => {
    const actualAmount = getNumericValue(actualKey);
    const difference = actualAmount - registeredAmount;
    return (
      <TableRow>
        <TableCell className="font-medium">{label}</TableCell>
        <TableCell>{registeredAmount.toFixed(2)}</TableCell>
        <TableCell>
           <Input 
             type="text" 
             inputMode="decimal"
             placeholder="0.00" 
             value={actuals[actualKey] ?? '0'}
             onChange={e => handleActualChange(actualKey, e.target.value)}
             onFocus={() => handleFocus(actualKey)}
             className="w-32"
            />
        </TableCell>
        <TableCell className={difference === 0 ? 'text-muted-foreground' : (difference > 0 ? 'text-green-600' : 'text-destructive')}>
            {difference.toFixed(2)}
        </TableCell>
      </TableRow>
    )
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-6 w-6" />
          <CardTitle>مطابقة المبيعات</CardTitle>
        </div>
        <CardDescription>
            التاريخ: {record.date.toDateString()} - الفترة: {record.period === 'Morning' ? 'صباحية' : 'مسائية'} - الكاشير: {record.cashier}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
             <Alert variant={totalDifference === 0 ? 'default' : 'destructive'}>
                <Coins className="h-4 w-4" />
                <AlertTitle>الإجمالي المسجل: ${totalRegistered.toFixed(2)}</AlertTitle>
            </Alert>
            <Alert variant={totalDifference === 0 ? 'default' : (totalDifference > 0 ? 'default' : 'destructive')} className={`${totalDifference > 0 && 'border-green-500 text-green-700'}`}>
                {totalDifference === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                <AlertTitle>الإجمالي الفعلي: ${totalActual.toFixed(2)}</AlertTitle>
                <AlertDescription>
                    الفرق: ${totalDifference.toFixed(2)}
                </AlertDescription>
            </Alert>
        </div>
        
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>الحساب</TableHead>
                    <TableHead>المسجل</TableHead>
                    <TableHead>الفعلي</TableHead>
                    <TableHead>الفرق</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {record.cash && renderMatchingRow(record.cash.accountName || 'نقدي', record.cash.amount, 'cash')}
                {record.cards.map((card, i) => renderMatchingRow(card.accountName || `بطاقة ${i+1}`, card.amount, `card-${i}`))}
                {record.credits.map((credit, i) => renderMatchingRow(credit.accountName || `آجل ${i+1}`, credit.amount, `credit-${i}`))}
            </TableBody>
        </Table>

        <div className="space-y-2">
            <div className='flex items-center gap-2'>
                <MessageSquare className="h-5 w-5" />
                <Label htmlFor="notes">ملاحظات المطابقة</Label>
            </div>
            <Textarea id="notes" placeholder="اكتب ملاحظاتك هنا..." />
        </div>

        <div className="space-y-2">
            <Label htmlFor="attachment">إرفاق صورة (اختياري)</Label>
            <Input id="attachment" type="file" />
        </div>


      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
            <Ban className="ml-2 h-4 w-4" />
             رفض وإعادة للكاشير
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="ml-2 h-4 w-4" />
            حفظ واعتماد المطابقة
        </Button>
      </CardFooter>
    </Card>
  );
}
