import {
  Card,
  CardContent,
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
import { History } from 'lucide-react';

const salesRecords = [
  {
    date: 'يونيو 10, 2025',
    period: 'الصباحية',
    originalTotal: '1000.00 ريال',
    actualTotal: '1000.00 ريال',
    difference: 'مطابق',
  },
  {
    date: 'يونيو 9, 2025',
    period: 'المسائية',
    originalTotal: '6000.00 ريال',
    actualTotal: '6000.00 ريال',
    difference: 'مطابق',
  },
];

export function SalesRecords() {
  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>سجلات المبيعات المطابقة</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الإجمالي الأصلي</TableHead>
              <TableHead>الإجمالي الفعلي</TableHead>
              <TableHead>الفرق الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.period}</TableCell>
                <TableCell>{record.originalTotal}</TableCell>
                <TableCell>{record.actualTotal}</TableCell>
                <TableCell>
                  <Badge variant={record.difference === 'مطابق' ? 'default' : 'destructive'}>
                    {record.difference}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
