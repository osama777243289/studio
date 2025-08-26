
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
import { History, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const salesRecords = [
  {
    id: 'rec1',
    date: 'يونيو 10, 2025',
    period: 'الصباحية',
    total: '1000.00 ريال',
    status: 'بانتظار الرفع',
  },
  {
    id: 'rec2',
    date: 'يونيو 9, 2025',
    period: 'المسائية',
    total: '6000.00 ريال',
    status: 'تمت مطابقته',
  },
    {
    id: 'rec3',
    date: 'يونيو 9, 2025',
    period: 'الصباحية',
    total: '3500.00 ريال',
    status: 'بانتظار المطابقة',
  },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'بانتظار الرفع':
            return 'secondary'
        case 'بانتظار المطابقة':
            return 'destructive'
        case 'تمت مطابقته':
            return 'default'
        default:
            return 'outline'
    }
}


export function SalesRecords() {
  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>سجلات المبيعات</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesRecords.map((record) => (
              <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.period}</TableCell>
                <TableCell>{record.total}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(record.status)} className={
                    record.status === 'تمت مطابقته' ? 'bg-green-100 text-green-800' : 
                    record.status === 'بانتظار المطابقة' ? 'bg-yellow-100 text-yellow-800' : ''
                  }>
                    {record.status}
                  </Badge>
                </TableCell>
                 <TableCell>
                    {record.status !== 'بانتظار الرفع' && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/reports/cashier-sales?id=${record.id}`}>
                                <Printer className="ml-2 h-4 w-4"/>
                                عرض وطباعة
                            </Link>
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
