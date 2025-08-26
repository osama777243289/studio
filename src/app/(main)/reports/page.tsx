'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import Papa from 'papaparse';

const profitAndLossData = {
  title: 'بيان الأرباح والخسائر',
  period: 'للفترة المنتهية في 30 يونيو 2024',
  rows: [
    { description: 'الإيرادات', amount: null, isHeader: true },
    { description: 'المبيعات', amount: 120000.00, isHeader: false, indent: true },
    { description: 'الخدمات', amount: 35000.00, isHeader: false, indent: true },
    { description: 'إجمالي الإيرادات', amount: 155000.00, isHeader: true },
    { description: 'المصروفات', amount: null, isHeader: true },
    { description: 'الرواتب والأجور', amount: 60000.00, isHeader: false, indent: true },
    { description: 'الإيجار', amount: 12000.00, isHeader: false, indent: true },
    { description: 'التسويق', amount: 8500.00, isHeader: false, indent: true },
    { description: 'الخدمات', amount: 4200.00, isHeader: false, indent: true },
  ],
  footer: { description: 'صافي الربح', amount: 70300.00 },
};

const balanceSheetData = {
    title: 'الميزانية العمومية',
    period: 'كما في 30 يونيو 2024',
    rows: [
        { description: 'الأصول', amount: null, isHeader: true },
        { description: 'النقد', amount: 80500.00, isHeader: false, indent: true },
        { description: 'الذمم المدينة', amount: 15200.00, isHeader: false, indent: true },
        { description: 'المخزون', amount: 25000.00, isHeader: false, indent: true },
        { description: 'إجمالي الأصول', amount: 120700.00, isHeader: true, isTotal: true },
        { description: 'الخصوم وحقوق الملكية', amount: null, isHeader: true },
        { description: 'الذمم الدائنة', amount: 10400.00, isHeader: false, indent: true },
        { description: 'حقوق الملكية', amount: 110300.00, isHeader: false, indent: true },
        { description: 'إجمالي الخصوم وحقوق الملكية', amount: 120700.00, isHeader: true, isTotal: true },
    ],
    footer: null
}


export default function ReportsPage() {

    const formatAmount = (amount: number | null) => {
        if (amount === null) return '';
        return `$${amount.toFixed(2)}`;
    }

    const handleExport = () => {
        const pnlCsv = Papa.unparse({
            fields: ['الوصف', 'المبلغ'],
            data: [
                ...profitAndLossData.rows.map(row => [row.description, row.amount ? formatAmount(row.amount) : '']),
                [profitAndLossData.footer.description, formatAmount(profitAndLossData.footer.amount)]
            ]
        });

        const balanceSheetCsv = Papa.unparse({
            fields: ['الوصف', 'المبلغ'],
            data: balanceSheetData.rows.map(row => [row.description, row.amount ? formatAmount(row.amount) : ''])
        });

        const combinedCsv = `${profitAndLossData.title}\n${profitAndLossData.period}\n${pnlCsv}\n\n${balanceSheetData.title}\n${balanceSheetData.period}\n${balanceSheetCsv}`;
        
        const blob = new Blob([`\uFEFF${combinedCsv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'financial_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">التقارير المالية</h1>
                <p className="text-muted-foreground">عرض وتصدير بياناتك المالية.</p>
            </div>
            <Button onClick={handleExport}>
                <Download className="ml-2 h-4 w-4" />
                تصدير الكل
            </Button>
        </div>

      <Tabs defaultValue="p-l" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="p-l">الأرباح والخسائر</TabsTrigger>
          <TabsTrigger value="balance-sheet">الميزانية العمومية</TabsTrigger>
        </TabsList>
        <TabsContent value="p-l">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{profitAndLossData.title}</CardTitle>
              <CardDescription>{profitAndLossData.period}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitAndLossData.rows.map((row, index) => (
                      <TableRow key={index} className={row.isHeader ? "font-medium" : ""}>
                          <TableCell className={row.indent ? "pr-8" : ""}>{row.description}</TableCell>
                          <TableCell className="text-left">{row.amount !== null ? formatAmount(row.amount) : ''}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="text-lg font-bold bg-muted/50">
                    <TableCell>{profitAndLossData.footer.description}</TableCell>
                    <TableCell className="text-left text-green-600">{formatAmount(profitAndLossData.footer.amount)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{balanceSheetData.title}</CardTitle>
              <CardDescription>{balanceSheetData.period}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {balanceSheetData.rows.map((row, index) => (
                         <TableRow key={index} className={`${row.isHeader ? "font-medium" : ""} ${row.isTotal ? "bg-muted/20" : ""}`}>
                            <TableCell className={row.indent ? "pr-8" : ""}>{row.description}</TableCell>
                            <TableCell className="text-left">{row.amount !== null ? formatAmount(row.amount) : ''}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
