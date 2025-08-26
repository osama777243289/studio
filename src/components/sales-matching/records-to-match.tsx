
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
import type { SalesRecord } from './matching-form';
import { cn } from '@/lib/utils';


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
            {records.map((record, index) => (
              <TableRow 
                key={index} 
                className={cn("cursor-pointer hover:bg-muted/50", selectedRecord?.date === record.date && selectedRecord?.period === record.period && 'bg-primary/10 hover:bg-primary/20')}
                onClick={() => onSelectRecord(record)}
              >
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.period}</TableCell>
                <TableCell>{record.cashier}</TableCell>
                <TableCell>{record.total.toFixed(2)} ريال</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
