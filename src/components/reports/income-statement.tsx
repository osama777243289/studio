
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

const incomeStatementData = {
  title: 'قائمة الدخل (بيان الأرباح والخسائر)',
  period: 'للفترة من 1 يناير 2024 إلى 30 يونيو 2024',
  revenues: [
    { code: '4101', name: 'إيرادات المبيعات', amount: 150000.00, isHeader: false },
    { code: '4201', name: 'إيرادات أخرى', amount: 5000.00, isHeader: false },
  ],
  cogs: [
    { code: '5101', name: 'تكلفة البضاعة المباعة', amount: 80000.00, isHeader: false },
  ],
  expenses: [
    { code: '5201', name: 'مصاريف بيع وتسويق', amount: 15000.00, isHeader: false },
    { code: '5301', name: 'مصاريف عمومية وإدارية', amount: 25000.00, isHeader: false },
  ],
};

export function IncomeStatement() {
    
    const totalRevenues = incomeStatementData.revenues.reduce((sum, item) => sum + item.amount, 0);
    const totalCogs = incomeStatementData.cogs.reduce((sum, item) => sum + item.amount, 0);
    const grossProfit = totalRevenues - totalCogs;
    const totalExpenses = incomeStatementData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = grossProfit - totalExpenses;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{incomeStatementData.title}</CardTitle>
                <CardDescription>{incomeStatementData.period}</CardDescription>
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
                        <TableRow className="font-bold bg-muted/20">
                            <TableCell colSpan={2}>الإيرادات</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {incomeStatementData.revenues.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                            <TableCell colSpan={2}>إجمالي الإيرادات</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalRevenues)}</TableCell>
                        </TableRow>

                        <TableRow className="font-bold bg-muted/20">
                             <TableCell colSpan={2}>تكلفة المبيعات</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {incomeStatementData.cogs.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                        ))}

                        <TableRow className="font-bold text-lg bg-muted/50">
                            <TableCell colSpan={2}>مجمل الربح</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(grossProfit)}</TableCell>
                        </TableRow>

                        <TableRow className="font-bold bg-muted/20">
                             <TableCell colSpan={2}>المصروفات التشغيلية</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {incomeStatementData.expenses.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold">
                            <TableCell colSpan={2}>إجمالي المصروفات التشغيلية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(totalExpenses)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-extrabold text-xl bg-primary/10 text-primary">
                            <TableCell colSpan={2}>صافي الدخل (الربح)</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(netIncome)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
