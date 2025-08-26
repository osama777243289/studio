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
import { FileCheck, Coins, Receipt, Wallet, CreditCard, BookUser, MessageSquare, Upload, Ban, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MatchingForm() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-6 w-6" />
          <CardTitle>مطابقة المبيعات</CardTitle>
        </div>
        <CardDescription>
            التاريخ: 10 يونيو 2025 - الفترة: الصباحية - الكاشير: يوسف خالد
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert variant='destructive'>
            <Coins className="h-4 w-4" />
            <AlertTitle>الإجمالي المسجل: 3500.00 ريال</AlertTitle>
        </Alert>


        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <Wallet className="h-5 w-5" />
                    <Label htmlFor="cash-actual">النقد الفعلي</Label>
                </div>
                <Input id="cash-actual" placeholder="0.00" type="number" />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <CreditCard className="h-5 w-5" />
                    <Label htmlFor="card-actual">الشبكة الفعلية</Label>
                </div>
                <Input id="card-actual" placeholder="0.00" type="number" />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <BookUser className="h-5 w-5" />
                    <Label htmlFor="credit-actual">الأجل الفعلي</Label>
                </div>
                <Input id="credit-actual" placeholder="0.00" type="number" />
            </div>
             <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <Receipt className="h-5 w-5 text-green-600" />
                    <Label htmlFor="total-actual" className='text-green-600'>الإجمالي الفعلي</Label>
                </div>
                <Input id="total-actual" placeholder="0.00" type="number" readOnly className="border-green-600 focus-visible:ring-green-500" />
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
