
'use client';

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeStatement } from "@/components/reports/income-statement";
import { BalanceSheet } from "@/components/reports/balance-sheet";
import { TrialBalance } from "@/components/reports/trial-balance";

export default function ReportsPage() {

    // Placeholder for export functionality
    const handleExport = () => {
        alert("سيتم تفعيل خاصية التصدير في المراحل القادمة.");
    }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">التقارير المالية</h1>
                <p className="text-muted-foreground">عرض وتصدير بياناتك المالية.</p>
            </div>
            <Button onClick={handleExport} className="w-full sm:w-auto">
                <Download className="ml-2 h-4 w-4" />
                تصدير الكل
            </Button>
        </div>

      <Tabs defaultValue="trial-balance" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
          <TabsTrigger value="trial-balance">ميزان المراجعة</TabsTrigger>
          <TabsTrigger value="income-statement">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="balance-sheet">المركز المالي</TabsTrigger>
          <TabsTrigger value="other-reports">تقارير أخرى</TabsTrigger>
        </TabsList>
        <TabsContent value="trial-balance">
            <TrialBalance />
        </TabsContent>
        <TabsContent value="income-statement">
            <IncomeStatement />
        </TabsContent>
        <TabsContent value="balance-sheet">
            <BalanceSheet />
        </TabsContent>
        <TabsContent value="other-reports">
             {/* This can be used for other reports like Cashier Sales Report link */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
