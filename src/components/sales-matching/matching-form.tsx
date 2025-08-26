
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
import { FileCheck, Coins, Receipt, Wallet, CreditCard, BookUser, MessageSquare, Ban, Save, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

export interface SalesRecord {
    date: string;
    period: 'الصباحية' | 'المسائية';
    cashier: string;
    total: string;
    status: string;
}

interface MatchingFormProps {
    record: SalesRecord | null;
}

export function MatchingForm({ record }: MatchingFormProps) {
  const [cashActual, setCashActual] = useState(0);
  const [cardActual, setCardActual] = useState(0);
  const [creditActual, setCreditActual] = useState(0);

  const totalActual = cashActual + cardActual + creditActual;

  useEffect(() => {
    // Reset values when record changes
    setCashActual(0);
    setCardActual(0);
    setCreditActual(0);
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
                    <AlertTitle>لا يوجد سجل محدد</AlertTitle>
                    <AlertDescription>
                        يرجى تحديد سجل من قائمة "السجلات بانتظار المطابقة" لبدء العمل.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
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
            التاريخ: {record.date} - الفترة: {record.period} - الكاشير: {record.cashier}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert variant='destructive'>
            <Coins className="h-4 w-4" />
            <AlertTitle>الإجمالي المسجل: {parseFloat(record.total).toFixed(2)} ريال</AlertTitle>
        </Alert>


        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <Wallet className="h-5 w-5" />
                    <Label htmlFor="cash-actual">النقد الفعلي</Label>
                </div>
                <Input id="cash-actual" placeholder="0.00" type="number" value={cashActual} onChange={e => setCashActual(parseFloat(e.target.value) || 0)} />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <CreditCard className="h-5 w-5" />
                    <Label htmlFor="card-actual">الشبكة الفعلية</Label>
                </div>
                <Input id="card-actual" placeholder="0.00" type="number" value={cardActual} onChange={e => setCardActual(parseFloat(e.target.value) || 0)} />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <BookUser className="h-5 w-5" />
                    <Label htmlFor="credit-actual">الأجل الفعلي</Label>
                </div>
                <Input id="credit-actual" placeholder="0.00" type="number" value={creditActual} onChange={e => setCreditActual(parseFloat(e.target.value) || 0)} />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <Receipt className="h-5 w-5 text-green-600" />
                    <Label htmlFor="total-actual" className='text-green-600'>الإجمالي الفعلي</Label>
                </div>
                <Input id="total-actual" value={totalActual.toFixed(2)} type="number" readOnly className="border-green-600 focus-visible:ring-green-500 font-bold" />
            </div>
        </div>

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
