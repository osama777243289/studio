
"use client";

import { CashierReport } from "@/components/reports/cashier-report";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function CashierSalesReportPage() {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold font-headline">تقرير مبيعات الكاشير</h1>
                <Button onClick={handlePrint}>
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة أو حفظ PDF
                </Button>
            </div>
            {/* The ref is no longer needed but we can keep the div for structure */}
            <div className="printable-area">
                <CashierReport />
            </div>
        </div>
    )
}
