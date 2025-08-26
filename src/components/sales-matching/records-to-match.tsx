import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ListChecks } from 'lucide-react';

const recordsToMatch = [
  {
    date: 'يونيو 10, 2025',
    period: 'الصباحية',
    cashier: 'يوسف خالد',
    total: '3500.00 ريال',
    status: 'بانتظار المطابقة',
  },
  {
    date: 'يونيو 9, 2025',
    period: 'المسائية',
    cashier: 'أحمد منصور',
    total: '4200.00 ريال',
    status: 'بانتظار المطابقة',
  },
];

export function RecordsToMatch() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          <CardTitle>السجلات بانتظار المطابقة</CardTitle>
        </div>
        <CardDescription>
          اختر سجلاً من القائمة أدناه لبدء عملية المطابقة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الكاشير</TableHead>
              <TableHead>الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordsToMatch.map((record, index) => (
              <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.period}</TableCell>
                <TableCell>{record.cashier}</TableCell>
                <TableCell>{record.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
