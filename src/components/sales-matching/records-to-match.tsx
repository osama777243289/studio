
'use client';

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
import { Badge } from '../ui/badge';


interface RecordsToMatchProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    records: SalesRecord[];
    onSelectRecord: (record: SalesRecord) => void;
    selectedRecord: SalesRecord | null;
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'قيد المطابقة':
            return 'destructive';
        case 'مطابق':
            return 'default';
        default:
            return 'secondary';
    }
}

const translateStatus = (status: string) => {
    switch (status) {
        case 'Pending Upload': return 'قيد الرفع';
        case 'Pending Matching': return 'قيد المطابقة';
        case 'Matched': return 'مطابق';
        default: return status;
    }
}

export function RecordsToMatch({ title, description, icon, records, onSelectRecord, selectedRecord }: RecordsToMatchProps) {
  const isSelectable = records.some(r => r.status === 'Pending Matching');
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لم يتم العثور على سجلات.</p>
        ) : (
            <div className='overflow-x-auto'>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الكاشير</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => {
                    const statusText = translateStatus(record.status);
                    return (
                        <TableRow 
                            key={record.id}
                            className={cn(isSelectable && "cursor-pointer hover:bg-muted/50", selectedRecord?.id === record.id && 'bg-primary/10 hover:bg-primary/20')}
                            onClick={() => onSelectRecord(record)}
                        >
                            <TableCell>{format(record.date.toDate(), 'yyyy/MM/dd')} - {record.period === 'Morning' ? 'صباحية' : 'مسائية'}</TableCell>
                            <TableCell>{record.cashier}</TableCell>
                            <TableCell>${record.total.toFixed(2)}</TableCell>
                             <TableCell>
                                <Badge variant={getStatusVariant(statusText)} className={
                                    record.status === 'Matched' ? 'bg-green-100 text-green-800' : 
                                    record.status === 'Pending Matching' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-blue-100 text-blue-800'
                                }>
                                    {statusText}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
