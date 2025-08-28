

'use client';

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Info,
  User,
  Wallet,
  CreditCard,
  PlusCircle,
  Trash2,
  BookUser,
  Pencil,
  Loader2,
  Hash,
  Paperclip
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { Account } from '../chart-of-accounts/account-tree';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addSaleRecord, salesRecordSchema } from '@/lib/firebase/firestore/sales';
import { useToast } from '@/hooks/use-toast';


interface SalesFormProps {
    accounts: Account[];
}

// Helper to flatten the account tree and filter by classification
const getAccountsByClassification = (accounts: Account[], classifications: string[]): Account[] => {
    const flattened: Account[] = [];
    const traverse = (accs: Account[]) => {
        for (const acc of accs) {
             // A transactional account is one that does not have children.
            if (!acc.children || acc.children.length === 0) {
                if (acc.classifications.some(c => classifications.includes(c))) {
                    flattened.push(acc);
                }
            }
            if (acc.children) {
                traverse(acc.children);
            }
        }
    };
    traverse(accounts);
    return flattened;
};

export function SalesForm({ accounts }: SalesFormProps) {
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(salesRecordSchema),
    defaultValues: {
        date: new Date(),
        period: 'Morning',
        salesperson: '',
        postingNumber: '',
        cash: { accountId: '', amount: 0 },
        cards: [],
        credits: [],
    }
  });

  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({
    control: form.control,
    name: "cards"
  });

  const { fields: creditFields, append: appendCredit, remove: removeCredit } = useFieldArray({
    control: form.control,
    name: "credits"
  });

  const cashAccounts = useMemo(() => getAccountsByClassification(accounts, ['كاشير']), [accounts]);
  const networkAccounts = useMemo(() => getAccountsByClassification(accounts, ['شبكات']), [accounts]);
  const customerAccounts = useMemo(() => getAccountsByClassification(accounts, ['عملاء']), [accounts]);

  const onSubmit = async (data: any) => {
    try {
      await addSaleRecord(data);
      toast({
        title: 'تم حفظ سجل المبيعات',
        description: `تم تسجيل المبيعات بنجاح لـ ${format(data.date, 'PPP')} (${data.period}).`
      });
      form.reset({
        date: new Date(),
        period: 'Morning',
        salesperson: '',
        postingNumber: '',
        cash: { accountId: '', amount: 0 },
        cards: [],
        credits: [],
      });
    } catch (error: any) {
       console.error("Failed to add sales record:", error);
      toast({
        title: 'فشل حفظ سجل المبيعات',
        description: error.message || 'لا يمكن حفظ سجلات المبيعات. الرجاء مراجعة اتصالك.',
        variant: 'destructive',
      });
    }
  }
  
 const handleImageUpload = async (file: File | undefined, index: number) => {
    if (!file) return;

    if (file.size > 1024 * 1024 * 5) { // 5MB limit
      toast({ title: 'خطأ', description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // result contains the base64 data URL
      const dataUrl = reader.result as string;
      form.setValue(`cards.${index}.receiptImage`, dataUrl, { shouldValidate: true });
      toast({ title: 'نجاح', description: 'تم إرفاق الصورة بنجاح وجاهزة للرفع عند الحفظ.' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
     <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Pencil className="h-6 w-6" />
            <CardTitle>إدخال / تعديل المبيعات اليومية</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>إدخال جديد</AlertTitle>
            <AlertDescription>
              الرجاء تحديد تاريخ لبدء إدخال جديد أو تحديد سجل سابق لعرضه أو تعديله.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Controller
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className="w-full justify-start text-right font-normal"
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'PPP') : <span>اختر تاريخًا</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <Label>الفترة</Label>
                </div>
                <Controller
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="Morning" id="morning" />
                                <Label htmlFor="morning">صباحية</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="Evening" id="evening" />
                                <Label htmlFor="evening">مسائية</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className='flex items-center gap-2'>
                  <User className="h-5 w-5" />
                  <Label htmlFor="salesperson">مندوب المبيعات</Label>
                </div>
                <Input id="salesperson" placeholder="مثال: يوسف خالد" {...form.register('salesperson')} />
                {form.formState.errors.salesperson && <p className="text-sm font-medium text-destructive">{form.formState.errors.salesperson.message as string}</p>}
              </div>
               <div className="space-y-2">
                <div className='flex items-center gap-2'>
                  <Hash className="h-5 w-5" />
                  <Label htmlFor="postingNumber">رقم الترحيل (اختياري)</Label>
                </div>
                <Input id="postingNumber" placeholder="مثال: JV-00123" {...form.register('postingNumber')} />
              </div>
           </div>

          <Card className="p-4">
            <CardHeader className="p-2">
                <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <CardTitle className="text-lg">نقدي</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cash-account">الحساب</Label>
                 <Controller
                    control={form.control}
                    name="cash.accountId"
                    render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="cash-account">
                                <SelectValue placeholder="اختر حسابًا نقديًا" />
                            </SelectTrigger>
                            <SelectContent>
                                {cashAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash-amount">المبلغ</Label>
                <Input id="cash-amount" placeholder="0.00" type="number" {...form.register('cash.amount', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="p-2">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle className="text-lg">بطاقة/شبكة</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              {cardFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-md space-y-3 relative">
                    <div className="flex justify-between items-center">
                        <Label>بطاقة {index + 1}</Label>
                        
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCard(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        
                    </div>
                   <div className="space-y-2">
                    <Label htmlFor={`card-name-${field.id}`}>حساب البطاقة</Label>
                     <Controller
                        control={form.control}
                        name={`cards.${index}.accountId`}
                        render={({ field: selectField }) => (
                            <Select onValueChange={selectField.onChange} value={selectField.value}>
                                <SelectTrigger id={`card-name-${field.id}`}>
                                    <SelectValue placeholder="اختر حساب الشبكة" />
                                </SelectTrigger>
                                <SelectContent>
                                {networkAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                     />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`card-amount-${field.id}`}>المبلغ</Label>
                    <Input id={`card-amount-${field.id}`} placeholder="0.00" type="number" {...form.register(`cards.${index}.amount`, { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor={`card-receipt-${index}`}>إيصال الشبكة (اختياري)</Label>
                      <div className="flex items-center gap-2">
                         <Input
                            id={`card-receipt-${index}`}
                            type="file"
                            accept="image/*"
                            className="flex-grow"
                            onChange={(e) => handleImageUpload(e.target.files?.[0], index)}
                         />
                      </div>
                       {form.watch(`cards.${index}.receiptImage`) && (
                          <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <Paperclip className="h-3 w-3" />
                              تم إرفاق الصورة وجاهزة للرفع عند الحفظ.
                          </div>
                      )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={() => appendCard({ accountId: '', amount: 0, receiptImage: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة حساب بطاقة
              </Button>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardHeader className="p-2">
                 <div className="flex items-center gap-2">
                    <BookUser className="h-5 w-5" />
                    <CardTitle className="text-lg">آجل/ذمم مدينة</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              {creditFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-md space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <Label>ذمة {index + 1}</Label>
                     
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCredit(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`credit-name-${field.id}`}>حساب العميل</Label>
                    <Controller
                        control={form.control}
                        name={`credits.${index}.accountId`}
                        render={({ field: selectField }) => (
                            <Select onValueChange={selectField.onChange} value={selectField.value}>
                                <SelectTrigger id={`credit-name-${field.id}`}>
                                    <SelectValue placeholder="اختر حساب العميل" />
                                </SelectTrigger>
                                <SelectContent>
                                {customerAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                     />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`credit-amount-${field.id}`}>المبلغ</Label>
                    <Input id={`credit-amount-${field.id}`} placeholder="0.00" type="number" {...form.register(`credits.${index}.amount`, { valueAsNumber: true })} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={() => appendCredit({ accountId: '', amount: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة حساب آجل
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 جاري الحفظ...
               </>
             ) : (
                'إرسال وتحليل المبيعات'
             )}
        </Button>
      </CardFooter>
    </form>
    </Card>
  );
}

    
