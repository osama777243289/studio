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
                <h1 className="text-3xl font-bold font-headline">التقارير المالية</h1>
                <p className="text-muted-foreground">عرض وتصدير بياناتك المالية.</p>
            </div>
            <Button>
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
              <CardTitle className="font-headline">بيان الأرباح والخسائر</CardTitle>
              <CardDescription>للفترة المنتهية في 30 يونيو 2024</CardDescription>
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
                  <TableRow className="font-medium">
                    <TableCell>الإيرادات</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">المبيعات</TableCell>
                    <TableCell className="text-left">$120,000.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pr-8">الخدمات</TableCell>
                    <TableCell className="text-left">$35,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>إجمالي الإيرادات</TableCell>
                    <TableCell className="text-left">$155,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>المصروفات</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">الرواتب والأجور</TableCell>
                    <TableCell className="text-left">$60,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">الإيجار</TableCell>
                    <TableCell className="text-left">$12,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">التسويق</TableCell>
                    <TableCell className="text-left">$8,500.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pr-8">الخدمات</TableCell>
                    <TableCell className="text-left">$4,200.00</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="text-lg font-bold bg-muted/50">
                    <TableCell>صافي الربح</TableCell>
                    <TableCell className="text-left text-green-600">$70,300.00</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">الميزانية العمومية</CardTitle>
              <CardDescription>كما في 30 يونيو 2024</CardDescription>
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
                  <TableRow className="font-medium text-base">
                    <TableCell>الأصول</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">النقد</TableCell>
                    <TableCell className="text-left">$80,500.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">الذمم المدينة</TableCell>
                    <TableCell className="text-left">$15,200.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">المخزون</TableCell>
                    <TableCell className="text-left">$25,000.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/20">
                    <TableCell>إجمالي الأصول</TableCell>
                    <TableCell className="text-left">$120,700.00</TableCell>
                  </TableRow>

                   <TableRow className="font-medium text-base">
                    <TableCell>الخصوم وحقوق الملكية</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pr-8">الذمم الدائنة</TableCell>
                    <TableCell className="text-left">$10,400.00</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="pr-8">حقوق الملكية</TableCell>
                    <TableCell className="text-left">$110,300.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/20">
                    <TableCell>إجمالي الخصوم وحقوق الملكية</TableCell>
                    <TableCell className="text-left">$120,700.00</TableCell>
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
