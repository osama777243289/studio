import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';

const chartOfAccountsData: Account[] = [
  {
    id: '1',
    code: '1000',
    name: 'الأصول',
    children: [
      {
        id: '1-1',
        code: '1100',
        name: 'الأصول المتداولة',
        children: [
          { id: '1-1-1', code: '1110', name: 'النقدية وما في حكمها' },
          { id: '1-1-2', code: '1120', name: 'الذمم المدينة' },
        ],
      },
      {
        id: '1-2',
        code: '1200',
        name: 'الأصول غير المتداولة',
        children: [
            { id: '1-2-1', code: '1210', name: 'العقارات والمعدات' }
        ],
      },
    ],
  },
  {
    id: '2',
    code: '2000',
    name: 'الخصوم',
    children: [
      {
        id: '2-1',
        code: '2100',
        name: 'الخصوم المتداولة',
        children: [{ id: '2-1-1', code: '2110', name: 'الذمم الدائنة' }],
      },
    ],
  },
  {
    id: '3',
    code: '3000',
    name: 'حقوق الملكية',
    children: [
      { id: '3-1-1', code: '3100', name: 'رأس المال' },
      { id: '3-1-2', code: '3200', name: 'الأرباح المحتجزة' },
    ]
  },
  {
    id: '4',
    code: '4000',
    name: 'الإيرادات',
     children: [
      { id: '4-1-1', code: '4100', name: 'إيرادات المبيعات' },
    ]
  },
  {
    id: '5',
    code: '5000',
    name: 'المصروفات',
    children: [
      { id: '5-1-1', code: '5100', name: 'مصروفات التشغيل' },
      { id: '5-1-2', code: '5200', name: 'مصروفات عمومية وإدارية' },
    ]
  },
];

export default function ChartOfAccountsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">دليل الحسابات</CardTitle>
                <CardDescription>تصفح وقم بإدارة شجرة الحسابات المحاسبية الخاصة بك.</CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button variant="outline">
                    <FileDown className="ml-2 h-4 w-4" />
                    تصدير
                </Button>
                <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة حساب
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4">
            <AccountTree accounts={chartOfAccountsData} />
        </div>
      </CardContent>
    </Card>
  );
}
