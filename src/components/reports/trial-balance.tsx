
"use client";

import { useEffect, useMemo, useState, Fragment } from 'react';
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
import { cn } from '@/lib/utils';


export function TrialBalance() {
    const [treeData, setTreeData] = useState<TrialBalanceAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTrialBalanceData(true); // Fetch data as a tree
                setTreeData(data);
            } catch (e: any) {
                console.error("Failed to fetch trial balance:", e);
                setError("فشل تحميل بيانات ميزان المراجعة. يرجى المحاولة مرة أخرى.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const totals = useMemo(() => {
        return treeData.reduce((totals, acc) => {
                totals.movementDebit += acc.movementDebit;
                totals.movementCredit += acc.movementCredit;
                totals.closingDebit += acc.closingDebit;
                totals.closingCredit += acc.closingCredit;
                return totals;
            }, { movementDebit: 0, movementCredit: 0, closingDebit: 0, closingCredit: 0 });
    }, [treeData]);
    
    const formatCurrency = (amount: number) => {
      if (amount === 0) return '-';
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    const renderTree = (accounts: TrialBalanceAccount[]) => {
        const levelFilter = parseInt(selectedLevel, 10);
        return accounts.map(account => {
            const showRow = selectedLevel === 'all' || account.level === levelFilter;
            
            return (
                <Fragment key={account.id}>
                    {showRow && (
                        <TableRow className={cn(
                            account.level === 1 && "font-bold bg-primary/20",
                            account.level === 2 && "font-semibold bg-primary/10",
                            account.level === 3 && "bg-primary/5",
                        )}>
                            <TableCell className="font-mono" style={{paddingRight: `${(account.level > 1 ? account.level - 1 : 0) * 1.5 + 1}rem`}}>
                              {account.code}
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell className="text-center font-mono">{formatCurrency(account.movementDebit)}</TableCell>
                            <TableCell className="text-center font-mono">{formatCurrency(account.movementCredit)}</TableCell>
                            <TableCell className="text-center font-mono">{formatCurrency(account.closingDebit)}</TableCell>
                            <TableCell className="text-center font-mono">{formatCurrency(account.closingCredit)}</TableCell>
                        </TableRow>
                    )}
                    {account.children && account.children.length > 0 && renderTree(account.children)}
                </Fragment>
            )
        });
    };

    const getFlatFilteredData = () => {
        if (selectedLevel === 'all') {
            const flat: TrialBalanceAccount[] = [];
            const flatten = (items: TrialBalanceAccount[]) => {
                for (const item of items) {
                    flat.push(item);
                    if (item.children) flatten(item.children);
                }
            };
            flatten(treeData);
            return flat;
        }
        
        const levelFilter = parseInt(selectedLevel, 10);
        const flat: TrialBalanceAccount[] = [];
        const findLevel = (items: TrialBalanceAccount[]) => {
             for (const item of items) {
                if(item.level === levelFilter) {
                    flat.push(item);
                } else if (item.children) {
                    findLevel(item.children);
                }
            }
        };
        findLevel(treeData);
        return flat;
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline">ميزان المراجعة</CardTitle>
                        <CardDescription>عرض حركة وأرصدة جميع الحسابات بشكل شجري</CardDescription>
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
                                <TableHead rowSpan={2} className="w-[150px] align-middle">الرمز</TableHead>
                                <TableHead rowSpan={2} className="align-middle">اسم الحساب</TableHead>
                                <TableHead colSpan={2} className="text-center border-b">حركة الفترة</TableHead>
                                <TableHead colSpan={2} className="text-center border-b">الرصيد الختامي</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableHead className="text-center">مدين</TableHead>
                                <TableHead className="text-center">دائن</TableHead>
                                <TableHead className="text-center">مدين</TableHead>
                                <TableHead className="text-center">دائن</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {treeData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        لا توجد بيانات لعرضها.
                                    </TableCell>
                                </TableRow>
                            ) : selectedLevel === 'all' ? (
                                renderTree(treeData)
                            ) : (
                                getFlatFilteredData().map(account => (
                                     <TableRow key={account.id} className={cn(
                                        account.level === 1 && "font-bold bg-primary/20",
                                        account.level === 2 && "font-semibold bg-primary/10",
                                        account.level === 3 && "bg-primary/5",
                                    )}>
                                        <TableCell className="font-mono" style={{paddingRight: `${(account.level > 1 ? account.level - 1 : 0) * 1.5 + 1}rem`}}>
                                        {account.code}
                                        </TableCell>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell className="text-center font-mono">{formatCurrency(account.movementDebit)}</TableCell>
                                        <TableCell className="text-center font-mono">{formatCurrency(account.movementCredit)}</TableCell>
                                        <TableCell className="text-center font-mono">{formatCurrency(account.closingDebit)}</TableCell>
                                        <TableCell className="text-center font-mono">{formatCurrency(account.closingCredit)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="text-lg font-bold bg-muted">
                                    <TableCell colSpan={2}>الإجمالي</TableCell>
                                    <TableCell className="text-center font-mono">{formatCurrency(totals.movementDebit)}</TableCell>
                                    <TableCell className="text-center font-mono">{formatCurrency(totals.movementCredit)}</TableCell>
                                    <TableCell className="text-center font-mono">{formatCurrency(totals.closingDebit)}</TableCell>
                                    <TableCell className="text-center font-mono">{formatCurrency(totals.closingCredit)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
