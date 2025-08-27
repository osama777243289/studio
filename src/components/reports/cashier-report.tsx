
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
import { AlertCircle, Calendar, CheckCircle2, FileText, Gift, Lightbulb, MessageSquare, RefreshCw, Wallet, CreditCard, BookUser, Hash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const reportData = {
    id: "REP-20240610-001",
    postingNumber: "JV-00512",
    period: "المسائية",
    date: "يونيو 9, 2025",
    status: "تمت المطابقة",
    sales: [
        { method: "نقداً", icon: Wallet, original: 4000.00, actual: 4000.00, difference: 0, account: "كاشير 1" },
        { method: "بطاقة/شبكة", icon: CreditCard, original: 1000.00, actual: 1000.00, difference: 0, account: "شبكة زهرة جنائن" },
        { method: "أجل/ائتمان", icon: BookUser, original: 1000.00, actual: 1000.00, difference: 0, account: "التوصيل اسامه" },
    ],
    matchNotes: "مطابقة تلقائية للبيانات الافتراضية المدخلة للفترة المسائية.",
    matchDate: "يونيو 10, 2025 01:00",
    anomaly: {
        found: false,
        title: "لم يتم اكتشاف أي حالات شاذة",
        description: "بيانات افتراضية. لا توجد حالات شاذة.",
        details: "هذا التقرير يستند إلى بيانات الإدخال الأولية للمبيعات."
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 }).format(amount);
}

const getDifferenceText = (diff: number) => {
    if (diff === 0) return "مطابق";
    return formatCurrency(diff);
}

export function CashierReport() {

    const totalOriginal = reportData.sales.reduce((sum, item) => sum + item.original, 0);
    const totalActual = reportData.sales.reduce((sum, item) => sum + item.actual, 0);
    
  return (
    <div className="bg-background rounded-lg border p-4 sm:p-6 md:p-8 space-y-6 printable-area">
        <div className="text-center">
            <h1 className="text-2xl font-bold font-headline">تقرير مبيعات الكاشير للفترة: {reportData.period} ليوم: {reportData.date}</h1>
            <p className="text-sm text-muted-foreground">رقم التقرير: {reportData.id}</p>
        </div>

        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    <CardTitle className="text-lg">مبيعات {reportData.period} ليوم: {reportData.date}</CardTitle>
                </div>
                 <Badge variant={reportData.status === 'تمت المطابقة' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="ml-1 h-4 w-4" />
                    {reportData.status}
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
                        {reportData.sales.map((item, index) => {
                             const Icon = item.icon;
                             return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-muted-foreground"/>
                                        {item.method}
                                    </TableCell>
                                    <TableCell className="text-center">{item.original.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{item.actual.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{getDifferenceText(item.difference)}</TableCell>
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
                    <p>نقداً (أصلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='نقداً')?.original.toFixed(2) || '0.00'} ريال</p>
                    <p>نقداً (فعلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='نقداً')?.actual.toFixed(2) || '0.00'} ريال مطابق</p>
                    <p>بطاقات (أصلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='بطاقة/شبكة')?.original.toFixed(2) || '0.00'} ريال</p>
                    <p>بطاقات (فعلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='بطاقة/شبكة')?.actual.toFixed(2) || '0.00'} ريال مطابق</p>
                    <p>آجل (أصلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='أجل/ائتمان')?.original.toFixed(2) || '0.00'} ريال</p>
                    <p>آجل (فعلي)</p><Separator className="flex-1" /><p className="font-mono text-left">{reportData.sales.find(s=>s.method==='أجل/ائتمان')?.actual.toFixed(2) || '0.00'} ريال مطابق</p>
                </div>
                 <div className="bg-muted/50 rounded-md p-3 font-bold text-base flex justify-between items-center">
                    <span>الإجمالي (الأصلي)</span>
                    <span className="font-mono">{totalOriginal.toFixed(2)} ريال</span>
                </div>
                <div className="bg-muted/50 rounded-md p-3 font-bold text-base flex justify-between items-center">
                    <span>الإجمالي (الفعلي)</span>
                    <span className="font-mono">{totalActual.toFixed(2)} ريال (مطابق)</span>
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
                <p className="text-sm text-muted-foreground">{reportData.matchNotes}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ المطابقة: {reportData.matchDate}</span>
                </div>
            </CardContent>
        </Card>
        
        <Alert variant={reportData.anomaly.found ? "destructive" : "default"}>
            {reportData.anomaly.found ? <AlertCircle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
            <AlertTitle>{reportData.anomaly.title}</AlertTitle>
            <AlertDescription>
                {reportData.anomaly.description}
                <p className="text-xs text-muted-foreground mt-2">{reportData.anomaly.details}</p>
            </AlertDescription>
        </Alert>

    </div>
  )
}
