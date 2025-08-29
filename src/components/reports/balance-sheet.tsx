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
import { getBalanceSheetData, BalanceSheetData, ReportAccount } from '@/lib/firebase/firestore/reports';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const initialData: BalanceSheetData = {
    assets: [],
    liabilities: [],
    equity: [],
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalLiabilitiesAndEquity: 0,
};

export function BalanceSheet() {
    const [data, setData] = useState<BalanceSheetData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedData = await getBalanceSheetData();
                setData(fetchedData);
            } catch(e: any) {
                console.error("Failed to fetch balance sheet:", e);
                setError("فشل تحميل بيانات قائمة المركز المالي. يرجى المحاولة مرة أخرى.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };
    
    const renderSection = (title: string, items: ReportAccount[]) => (
        <>
            <TableRow className="font-extrabold text-lg bg-muted/30">
                <TableCell colSpan={3}>{title}</TableCell>
            </TableRow>
            {items.map(item => (
                <TableRow key={item.code} className={item.level === 2 ? 'font-semibold' : ''}>
                    <TableCell className="font-mono" style={{ paddingRight: `${item.level * 1}rem` }}>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-left font-mono">{formatCurrency(item.balance)}</TableCell>
                </TableRow>
            ))}
        </>
    );

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">قائمة المركز المالي</CardTitle>
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
                    <CardTitle className="font-headline">قائمة المركز المالي</CardTitle>
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
                <CardTitle className="font-headline">قائمة المركز المالي (الميزانية العمومية)</CardTitle>
                <CardDescription>كما في تاريخه</CardDescription>
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
                        {renderSection('الأصول', data.assets)}
                        <TableRow className="font-bold text-lg bg-primary/10 text-primary">
                            <TableCell colSpan={2}>إجمالي الأصول</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalAssets)}</TableCell>
                        </TableRow>

                        {renderSection('الخصوم', data.liabilities)}
                        <TableRow className="font-semibold bg-muted/20">
                            <TableCell colSpan={2}>إجمالي الخصوم</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalLiabilities)}</TableCell>
                        </TableRow>

                        {renderSection('حقوق الملكية', data.equity)}
                         <TableRow className="font-semibold bg-muted/20">
                            <TableCell colSpan={2}>إجمالي حقوق الملكية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalEquity)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-extrabold text-xl bg-primary/10 text-primary">
                            <TableCell colSpan={2}>إجمالي الخصوم وحقوق الملكية</TableCell>
                            <TableCell className="text-left font-mono">{formatCurrency(data.totalLiabilitiesAndEquity)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
