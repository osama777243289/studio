
"use client";

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

const balanceSheetData = {
  title: 'قائمة المركز المالي (الميزانية العمومية)',
  period: 'كما في 30 يونيو 2024',
  assets: [
    { code: '11', name: 'الأصول المتداولة', amount: 120000.00, isHeader: true },
    { code: '1101', name: 'النقدية', amount: 80000.00, isHeader: false },
    { code: '1102', name: 'العملاء', amount: 25000.00, isHeader: false },
    { code: '1103', name: 'المخزون', amount: 15000.00, isHeader: false },
    { code: '12', name: 'الأصول الثابتة', amount: 30000.00, isHeader: true },
  ],
  liabilities: [
    { code: '21', name: 'الخصوم المتداولة', amount: 20000.00, isHeader: true },
    { code: '2101', name: 'ضريبة القيمة المضافة', amount: 12000.00, isHeader: false },
    { code: '2102', name: 'موردون', amount: 8000.00, isHeader: false },
  ],
  equity: [
    { code: '31', name: 'رأس المال', amount: 100000.00, isHeader: false },
    { code: '32', name: 'الأرباح المبقاة', amount: 30000.00, isHeader: false },
  ],
};

export function BalanceSheet() {
    
    const totalAssets = balanceSheetData.assets.reduce((sum, item) => item.isHeader ? sum + item.amount : sum, 0);
    const totalLiabilities = balanceSheetData.liabilities.reduce((sum, item) => item.isHeader ? sum + item.amount : sum, 0);
    const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };
    
    const renderSection = (title: string, items: {code: string; name: string; amount: number; isHeader: boolean}[]) => (
        <>
            <TableRow className="font-extrabold text-lg bg-muted/30">
                <TableCell colSpan={3}>{title}</TableCell>
            </TableRow>
            {items.map(item => (
                <TableRow key={item.code} className={item.isHeader ? 'font-semibold' : ''}>
                    <TableCell className="font-mono" style={{ paddingRight: item.isHeader ? '1rem' : '2rem' }}>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-left font-mono">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{balanceSheetData.title}</CardTitle>
                <CardDescription>{balanceSheetData.period}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">الرمز</TableHead>
                            <TableHead>البيان</TableHead>
                            <TableHead className="text-left">المبلغ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderSection('الأصول', balanceSheetData.assets)}
                        <TableRow className="font-bold text-lg bg-primary/10 text-primary">
                            <TableCell colSpan={2}>إجمالي الأصول</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalAssets)}</TableCell>
                        </TableRow>

                        {renderSection('الخصوم', balanceSheetData.liabilities)}
                        <TableRow className="font-semibold bg-muted/20">
                            <TableCell colSpan={2}>إجمالي الخصوم</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalLiabilities)}</TableCell>
                        </TableRow>

                        {renderSection('حقوق الملكية', balanceSheetData.equity)}
                         <TableRow className="font-semibold bg-muted/20">
                            <TableCell colSpan={2}>إجمالي حقوق الملكية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalEquity)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-extrabold text-xl bg-primary/10 text-primary">
                            <TableCell colSpan={2}>إجمالي الخصوم وحقوق الملكية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
