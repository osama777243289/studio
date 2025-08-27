
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
import { ListChecks } from 'lucide-react';
import { SalesRecord } from '@/lib/firebase/firestore/sales';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


interface RecordsToMatchProps {
    records: SalesRecord[];
    onSelectRecord: (record: SalesRecord) => void;
    selectedRecord: SalesRecord | null;
}


export function RecordsToMatch({ records, onSelectRecord, selectedRecord }: RecordsToMatchProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          <CardTitle>السجلات قيد المطابقة</CardTitle>
        </div>
        <CardDescription>
          اختر سجلاً من القائمة أدناه لبدء عملية المطابقة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد سجلات قيد المطابقة حاليًا.</p>
        ) : (
            <div className='overflow-x-auto'>
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
                {records.map((record) => (
                <TableRow 
                    key={record.id}
                    className={cn("cursor-pointer hover:bg-muted/50", selectedRecord?.id === record.id && 'bg-primary/10 hover:bg-primary/20')}
                    onClick={() => onSelectRecord(record)}
                >
                    <TableCell>{format(record.date.toDate(), 'PPP')}</TableCell>
                    <TableCell>{record.period === 'Morning' ? 'صباحية' : 'مسائية'}</TableCell>
                    <TableCell>{record.cashier}</TableCell>
                    <TableCell>${record.total.toFixed(2)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
