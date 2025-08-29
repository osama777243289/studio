"use client";

import { useEffect, useState } from 'react';
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
import { getIncomeStatementData, IncomeStatementData } from '@/lib/firebase/firestore/reports';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const initialData: IncomeStatementData = {
    revenues: [],
    cogs: [],
    expenses: [],
    totalRevenues: 0,
    totalCogs: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netIncome: 0
};

export function IncomeStatement() {
    const [data, setData] = useState<IncomeStatementData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedData = await getIncomeStatementData();
                setData(fetchedData);
            } catch(e: any) {
                console.error("Failed to fetch income statement:", e);
                setError("فشل تحميل بيانات قائمة الدخل. يرجى المحاولة مرة أخرى.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">قائمة الدخل</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">قائمة الدخل</CardTitle>
                </CardHeader>
                <CardContent>
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ في التحميل</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">قائمة الدخل (بيان الأرباح والخسائر)</CardTitle>
                <CardDescription>للفترة حتى تاريخه</CardDescription>
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
                            <TableCell colSpan={3}>الإيرادات</TableCell>
                        </TableRow>
                        {data.revenues.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.balance)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                            <TableCell colSpan={2}>إجمالي الإيرادات</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalRevenues)}</TableCell>
                        </TableRow>

                        <TableRow className="font-bold bg-muted/20">
                             <TableCell colSpan={3}>تكلفة المبيعات</TableCell>
                        </TableRow>
                        {data.cogs.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.balance)}</TableCell>
                            </TableRow>
                        ))}

                        <TableRow className="font-bold text-lg bg-muted/50">
                            <TableCell colSpan={2}>مجمل الربح</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.grossProfit)}</TableCell>
                        </TableRow>

                        <TableRow className="font-bold bg-muted/20">
                             <TableCell colSpan={3}>المصروفات التشغيلية</TableCell>
                        </TableRow>
                        {data.expenses.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-mono pr-8">{item.code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-left font-mono">{formatCurrency(item.balance)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold">
                            <TableCell colSpan={2}>إجمالي المصروفات التشغيلية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalExpenses)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-extrabold text-xl bg-primary/10 text-primary">
                            <TableCell colSpan={2}>صافي الدخل (الربح)</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.netIncome)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
