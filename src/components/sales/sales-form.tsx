
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { Account } from '../chart-of-accounts/account-tree';


interface SalesFormProps {
    accounts: Account[];
}

// Helper to flatten the account tree and filter by classification
const getAccountsByClassification = (accounts: Account[], classifications: string[]): Account[] => {
    const flattened: Account[] = [];
    const traverse = (accs: Account[]) => {
        for (const acc of accs) {
            if (acc.classifications.some(c => classifications.includes(c))) {
                flattened.push(acc);
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
  const [cardAccounts, setCardAccounts] = useState([{ id: 1, accountId: '', amount: '' }]);
  const [creditAccounts, setCreditAccounts] = useState([{ id: 1, accountId: '', amount: '' }]);
  
  const cashAccounts = useMemo(() => getAccountsByClassification(accounts, ['صندوق', 'بنك']), [accounts]);
  const networkAccounts = useMemo(() => getAccountsByClassification(accounts, ['شبكات']), [accounts]);
  const customerAccounts = useMemo(() => getAccountsByClassification(accounts, ['عملاء']), [accounts]);

  const addCardAccount = () => {
    setCardAccounts([...cardAccounts, { id: Date.now(), accountId: '', amount: '' }]);
  };

  const removeCardAccount = (id: number) => {
    setCardAccounts(cardAccounts.filter((account) => account.id !== id));
  };
  
  const addCreditAccount = () => {
    setCreditAccounts([...creditAccounts, { id: Date.now(), accountId: '', amount: '' }]);
  };

  const removeCreditAccount = (id: number) => {
    setCreditAccounts(creditAccounts.filter((account) => account.id !== id));
  };


  return (
    <Card>
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
              يرجى اختيار تاريخ لبدء إدخال جديد أو تحديد سجل سابق للعرض أو التعديل.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="date">التاريخ</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  <span>اختر تاريخاً</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <Label>الفترة</Label>
            </div>
            <RadioGroup defaultValue="morning" className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning">صباح</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="evening" id="evening" />
                <Label htmlFor="evening">مساء</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className='flex items-center gap-2'>
              <User className="h-5 w-5" />
              <Label htmlFor="salesperson">مسؤول البيع</Label>
            </div>
            <Input id="salesperson" placeholder="يوسف خالد محمد" />
          </div>

          <Card className="p-4">
            <CardHeader className="p-2">
                <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <CardTitle className="text-lg">نقداً</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cash-account">الحساب</Label>
                <Select>
                  <SelectTrigger id="cash-account">
                    <SelectValue placeholder="اختر حساب النقدية" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash-amount">المبلغ</Label>
                <Input id="cash-amount" placeholder="0.00" type="number" />
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
              {cardAccounts.map((account, index) => (
                <div key={account.id} className="p-3 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>بطاقة {index + 1}</Label>
                    {cardAccounts.length > 1 &&
                      <Button variant="ghost" size="icon" onClick={() => removeCardAccount(account.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`card-name-${account.id}`}>حساب البطاقة</Label>
                     <Select>
                        <SelectTrigger id={`card-name-${account.id}`}>
                            <SelectValue placeholder="اختر حساب الشبكة" />
                        </SelectTrigger>
                        <SelectContent>
                           {networkAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`card-amount-${account.id}`}>المبلغ</Label>
                    <Input id={`card-amount-${account.id}`} placeholder="0.00" type="number" />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addCardAccount}>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة حساب بطاقة
              </Button>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardHeader className="p-2">
                 <div className="flex items-center gap-2">
                    <BookUser className="h-5 w-5" />
                    <CardTitle className="text-lg">أجل/ائتمان</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-4">
              {creditAccounts.map((account, index) => (
                <div key={account.id} className="p-3 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>أجل {index + 1}</Label>
                     {creditAccounts.length > 1 &&
                        <Button variant="ghost" size="icon" onClick={() => removeCreditAccount(account.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     }
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`credit-name-${account.id}`}>حساب العميل</Label>
                    <Select>
                        <SelectTrigger id={`credit-name-${account.id}`}>
                            <SelectValue placeholder="اختر حساب العميل" />
                        </SelectTrigger>
                        <SelectContent>
                           {customerAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`credit-amount-${account.id}`}>المبلغ</Label>
                    <Input id={`credit-amount-${account.id}`} placeholder="0.00" type="number" />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addCreditAccount}>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة حساب أجل
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">إرسال وتحليل المبيعات</Button>
      </CardFooter>
    </Card>
  );
}
