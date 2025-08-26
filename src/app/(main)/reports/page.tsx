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

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Financial Reports</h1>
                <p className="text-muted-foreground">View and export your financial statements.</p>
            </div>
            <Button>
                <Download className="mr-2 h-4 w-4" />
                Export All
            </Button>
        </div>

      <Tabs defaultValue="p-l" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="p-l">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>
        <TabsContent value="p-l">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Profit & Loss Statement</CardTitle>
              <CardDescription>For the period ending June 30, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium">
                    <TableCell>Revenue</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Sales</TableCell>
                    <TableCell className="text-right">$120,000.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pl-8">Services</TableCell>
                    <TableCell className="text-right">$35,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right">$155,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Expenses</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Salaries & Wages</TableCell>
                    <TableCell className="text-right">$60,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Rent</TableCell>
                    <TableCell className="text-right">$12,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Marketing</TableCell>
                    <TableCell className="text-right">$8,500.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pl-8">Utilities</TableCell>
                    <TableCell className="text-right">$4,200.00</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="text-lg font-bold bg-muted/50">
                    <TableCell>Net Profit</TableCell>
                    <TableCell className="text-right text-green-600">$70,300.00</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Balance Sheet</CardTitle>
              <CardDescription>As of June 30, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium text-base">
                    <TableCell>Assets</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Cash</TableCell>
                    <TableCell className="text-right">$80,500.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Accounts Receivable</TableCell>
                    <TableCell className="text-right">$15,200.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Inventory</TableCell>
                    <TableCell className="text-right">$25,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/20">
                    <TableCell>Total Assets</TableCell>
                    <TableCell className="text-right">$120,700.00</TableCell>
                  </TableRow>

                   <TableRow className="font-medium text-base">
                    <TableCell>Liabilities & Equity</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Accounts Payable</TableCell>
                    <TableCell className="text-right">$10,400.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pl-8">Owner's Equity</TableCell>
                    <TableCell className="text-right">$110,300.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/20">
                    <TableCell>Total Liabilities & Equity</TableCell>
                    <TableCell className="text-right">$120,700.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
