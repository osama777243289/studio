
"use client";

import { CashierReport } from "@/components/reports/cashier-report";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";


export default function CashierSalesReportPage() {
    const reportRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        documentTitle: 'تقرير-مبيعات-الكاشير',
         pageStyle: `
            @media print {
                @page {
                    size: A4;
                    margin: 0.5in;
                }
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });


    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold font-headline">تقرير مبيعات الكاشير</h1>
                <Button onClick={handlePrint}>
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة التقرير
                </Button>
            </div>
            <div ref={reportRef}>
                <CashierReport />
            </div>
        </div>
    )
}
