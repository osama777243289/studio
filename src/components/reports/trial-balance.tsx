"use client";

import { useEffect, useMemo, useState } from 'react';
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
import { FileSearch, Loader2, AlertCircle } from 'lucide-react';
import { getTrialBalanceData, TrialBalanceAccount } from '@/lib/firebase/firestore/reports';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


export function TrialBalance() {
    const [allAccounts, setAllAccounts] = useState<TrialBalanceAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTrialBalanceData();
                setAllAccounts(data);
            } catch (e: any) {
                console.error("Failed to fetch trial balance:", e);
                setError("فشل تحميل بيانات ميزان المراجعة. يرجى المحاولة مرة أخرى.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        if (selectedLevel === 'all') return allAccounts;
        return allAccounts.filter(item => item.level <= parseInt(selectedLevel, 10));
    }, [selectedLevel, allAccounts]);

    const { totalDebit, totalCredit } = useMemo(() => {
        return allAccounts
            .filter(acc => acc.level === 1)
            .reduce((totals, acc) => {
                totals.totalDebit += acc.debit;
                totals.totalCredit += acc.credit;
                return totals;
            }, { totalDebit: 0, totalCredit: 0 });
    }, [allAccounts]);
    
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
                {loading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ في التحميل</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
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
                                <TableRow key={item.code} className={item.level === 1 ? "font-bold bg-muted/30" : ""}>
                                    <TableCell className="font-mono" style={{paddingRight: `${(item.level > 1 ? item.level : 0) * 1 + 1}rem`}}>
                                      {item.code}
                                    </TableCell>
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
                )}
            </CardContent>
        </Card>
    );
}
