
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '../ui/button';
import { FileSearch } from 'lucide-react';


const mockTrialBalanceData = [
  { level: 1, code: '1', name: 'الأصول', debit: 150000.00, credit: 0 },
  { level: 2, code: '11', name: 'الأصول المتداولة', debit: 120000.00, credit: 0 },
  { level: 3, code: '1101', name: 'النقدية بالصناديق والبنوك', debit: 80000.00, credit: 0 },
  { level: 4, code: '1101001', name: 'صندوق الكاشير الرئيسي', debit: 50000.00, credit: 0 },
  { level: 4, code: '1101002', name: 'حساب الشبكة', debit: 30000.00, credit: 0 },
  { level: 2, code: '12', name: 'الأصول الثابتة', debit: 30000.00, credit: 0 },
  { level: 1, code: '2', name: 'الخصوم', debit: 0, credit: 50000.00 },
  { level: 2, code: '21', name: 'الخصوم المتداولة', debit: 0, credit: 20000.00 },
  { level: 1, code: '3', name: 'حقوق الملكية', debit: 0, credit: 80000.00 },
  { level: 1, code: '4', name: 'الإيرادات', debit: 0, credit: 150000.00 },
  { level: 1, code: '5', name: 'المصروفات', debit: 130000.00, credit: 0 },
];


export function TrialBalance() {
    const [selectedLevel, setSelectedLevel] = useState('all');

    const filteredData = selectedLevel === 'all'
        ? mockTrialBalanceData
        : mockTrialBalanceData.filter(item => item.level <= parseInt(selectedLevel, 10));

    const totalDebit = filteredData.reduce((sum, item) => item.level === 1 ? sum + item.debit : sum, 0);
    const totalCredit = filteredData.reduce((sum, item) => item.level === 1 ? sum + item.credit : sum, 0);
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline">ميزان المراجعة</CardTitle>
                        <CardDescription>عرض أرصدة جميع الحسابات (مدينة ودائنة)</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="عرض حسب المستوى" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل المستويات</SelectItem>
                                <SelectItem value="1">المستوى الأول</SelectItem>
                                <SelectItem value="2">المستوى الثاني</SelectItem>
                                <SelectItem value="3">المستوى الثالث</SelectItem>
                                <SelectItem value="4">المستوى الرابع</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <FileSearch className="ml-2 h-4 w-4"/>
                            بحث متقدم
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">الرمز</TableHead>
                            <TableHead>اسم الحساب</TableHead>
                            <TableHead className="text-center">مدين</TableHead>
                            <TableHead className="text-center">دائن</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    لا توجد بيانات لعرضها.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                            <TableRow key={item.code} style={{paddingRight: `${(item.level - 1) * 20}px`}} className={item.level === 1 ? "font-bold bg-muted/30" : ""}>
                                <TableCell className="font-mono">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-center font-mono">{formatCurrency(item.debit)}</TableCell>
                                <TableCell className="text-center font-mono">{formatCurrency(item.credit)}</TableCell>
                            </TableRow>
                            ))
                        )}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="text-lg font-bold bg-muted">
                                <TableCell colSpan={2}>الإجمالي</TableCell>
                                <TableCell className="text-center font-mono">{formatCurrency(totalDebit)}</TableCell>
                                <TableCell className="text-center font-mono">{formatCurrency(totalCredit)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
