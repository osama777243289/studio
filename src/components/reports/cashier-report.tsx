
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, CheckCircle2, FileText, Gift, Lightbulb, MessageSquare, RefreshCw, Wallet, CreditCard, BookUser, Hash, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { SalesRecord, getSaleRecordById } from "@/lib/firebase/firestore/sales";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


// Mock data for initial design and when no data is fetched
const mockReportData: SalesRecord = {
    id: "REP-LOADING-001",
    postingNumber: "JV-LOADING",
    period: "Morning",
    date: { toDate: () => new Date() } as any,
    status: "Pending Upload",
    cashier: "Loading...",
    total: 0,
    cash: { accountId: "", accountName: "كاشير 1", amount: 0.00 },
    cards: [],
    credits: [],
    createdAt: { toDate: () => new Date() } as any,
};


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 }).format(amount);
}

const getDifferenceText = (diff: number) => {
    if (diff === 0) return "مطابق";
    return formatCurrency(diff);
}

export function CashierReport() {
    const searchParams = useSearchParams();
    const recordId = searchParams.get('id');
    const [record, setRecord] = useState<SalesRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (recordId) {
            const fetchRecord = async () => {
                setLoading(true);
                setError(null);
                try {
                    const fetchedRecord = await getSaleRecordById(recordId);
                    if(fetchedRecord) {
                        setRecord(fetchedRecord);
                    } else {
                        setError(`لم يتم العثور على تقرير بالمعرّف: ${recordId}`);
                    }
                } catch (e) {
                    console.error("Failed to fetch record:", e);
                    setError("فشل في تحميل بيانات التقرير.");
                } finally {
                    setLoading(false);
                }
            };
            fetchRecord();
        } else {
             setLoading(false);
             setError("لم يتم توفير معرّف التقرير في الرابط.");
        }
    }, [recordId]);

    const reportData = record || mockReportData;
    const isPreliminary = reportData.status === 'Pending Upload' || reportData.status === 'Pending Matching';
    const reportStatus = reportData.status === 'Matched' ? "تمت المطابقة" : (reportData.status === 'Pending Matching' ? "قيد المطابقة" : "قيد الرفع");
    
    const getActualAmount = (type: 'cash' | 'card' | 'credit', index: number = 0) => {
        if (isPreliminary) return 0;
        if (type === 'cash') return reportData.actuals?.['cash'] ?? reportData.cash.amount;
        if (type === 'card') return reportData.actuals?.[`card-${index}`] ?? reportData.cards[index]?.amount || 0;
        if (type === 'credit') return reportData.actuals?.[`credit-${index}`] ?? reportData.credits[index]?.amount || 0;
        return 0;
    };
    
    const getSalesData = () => {
        const sales = [];
        if (reportData.cash.amount > 0) sales.push({ method: "نقداً", icon: Wallet, original: reportData.cash.amount, actual: getActualAmount('cash'), account: reportData.cash.accountName || '' });
        reportData.cards.forEach((card, i) => sales.push({ method: "بطاقة/شبكة", icon: CreditCard, original: card.amount, actual: getActualAmount('card', i), account: card.accountName || '' }));
        reportData.credits.forEach((credit, i) => sales.push({ method: "أجل/ائتمان", icon: BookUser, original: credit.amount, actual: getActualAmount('credit', i), account: credit.accountName || '' }));
        return sales;
    }
    const salesData = getSalesData();
    const totalOriginal = salesData.reduce((sum, item) => sum + item.original, 0);
    const totalActual = salesData.reduce((sum, item) => sum + item.actual, 0);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
         return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
         );
    }
    
  return (
    <div className="bg-background rounded-lg border p-4 sm:p-6 md:p-8 space-y-6 printable-area">
        <div className="text-center">
            <h1 className="text-2xl font-bold font-headline">تقرير مبيعات الكاشير للفترة: {reportData.period === 'Morning' ? 'الصباحية' : 'المسائية'} ليوم: {reportData.date.toDate().toLocaleDateString('ar-SA')}</h1>
            <p className="text-sm text-muted-foreground">رقم التقرير: {reportData.id}</p>
        </div>

        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    <CardTitle className="text-lg">مبيعات {reportData.period === 'Morning' ? 'الصباحية' : 'المسائية'} ليوم: {reportData.date.toDate().toLocaleDateString('ar-SA')}</CardTitle>
                </div>
                 <Badge variant={reportStatus === 'تمت المطابقة' ? 'default' : 'destructive'} className={reportStatus === 'تمت المطابقة' ? "bg-green-100 text-green-800 border-green-300" : (reportStatus === 'قيد المطابقة' ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-blue-100 text-blue-800 border-blue-300")}>
                    {reportStatus === 'تمت المطابقة' ? <CheckCircle2 className="ml-1 h-4 w-4" /> : <AlertCircle className="ml-1 h-4 w-4" />}
                    {reportStatus}
                </Badge>
            </CardHeader>
            <CardContent>
                {reportData.postingNumber && (
                    <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                        <Hash className="h-4 w-4"/>
                        <span>رقم الترحيل: {reportData.postingNumber}</span>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">طريقة الدفع</TableHead>
                            <TableHead className="text-center">الأصلي</TableHead>
                            <TableHead className="text-center">الفعلي</TableHead>
                            <TableHead className="text-center">الفرق</TableHead>
                            <TableHead>الحسابات</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {salesData.map((item, index) => {
                             const Icon = item.icon;
                             const difference = item.actual - item.original;
                             return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-muted-foreground"/>
                                        {item.method}
                                    </TableCell>
                                    <TableCell className="text-center">{item.original.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{item.actual.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{getDifferenceText(difference)}</TableCell>
                                    <TableCell>{item.account}: {item.original.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle className="text-lg">ملخص مبيعات الفترة</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm">
                    {salesData.map((item, index) => (
                        <React.Fragment key={index}>
                           <p>{item.method} (أصلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{item.original.toFixed(2)} ريال</p>
                           <p>{item.method} (فعلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{item.actual.toFixed(2)} ريال ({getDifferenceText(item.actual - item.original)})</p>
                        </React.Fragment>
                    ))}
                </div>
                 <div className="bg-muted/50 rounded-md p-3 font-bold text-base flex justify-between items-center">
                    <span>الإجمالي (الأصلي)</span>
                    <span className="font-mono">{totalOriginal.toFixed(2)} ريال</span>
                </div>
                <div className="bg-muted/50 rounded-md p-3 font-bold text-base flex justify-between items-center">
                    <span>الإجمالي (الفعلي)</span>
                    <span className="font-mono">{totalActual.toFixed(2)} ريال ({getDifferenceText(totalActual - totalOriginal)})</span>
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle className="text-lg">ملاحظات المطابقة</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{isPreliminary ? "لم تتم المطابقة بعد." : reportData.matchNotes || "لا توجد ملاحظات."}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ المطابقة: {isPreliminary ? "N/A" : new Date().toLocaleDateString('ar-SA')}</span>
                </div>
            </CardContent>
        </Card>
        
        <Alert variant={reportStatus !== 'تمت المطابقة' ? "destructive" : "default"}>
            {reportStatus !== 'تمت المطابقة' ? <AlertCircle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
            <AlertTitle>{isPreliminary ? "تقرير مبدئي" : "حالة المطابقة"}</AlertTitle>
            <AlertDescription>
                {isPreliminary ? "هذا التقرير للإدخال الأولي فقط والمبالغ الفعلية لم تسجل بعد." : "تمت مطابقة هذا التقرير."}
            </AlertDescription>
        </Alert>

    </div>
  )
}
