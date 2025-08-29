
'use client';

import { useState, useEffect } from 'react';
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
import { History, Printer, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { SalesRecord, getSalesRecords } from '@/lib/firebase/firestore/sales';
import { format } from 'date-fns';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'قيد الرفع':
            return 'secondary'
        case 'قيد المطابقة':
            return 'destructive'
        case 'مطابق':
            return 'default'
        default:
            return 'outline'
    }
}


export function SalesRecords() {
    const [records, setRecords] = useState<SalesRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const fetchedRecords = await getSalesRecords(20);
                setRecords(fetchedRecords);
            } catch (error) {
                console.error("Failed to fetch sales records:", error);
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const translateStatus = (status: 'Pending Upload' | 'Pending Matching' | 'Ready for Posting' | 'Posted') => {
        switch (status) {
            case 'Pending Upload': return 'قيد الرفع';
            case 'Pending Matching': return 'قيد المطابقة';
            case 'Ready for Posting': return 'جاهز للترحيل';
            case 'Posted': return 'مرحل';
        }
    }

    const translatePeriod = (period: string) => {
        return period === 'Morning' ? 'صباحية' : 'مسائية';
    }


  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>سجلات المبيعات</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">لم يتم العثور على سجلات مبيعات.</p>
        ) : (
            <div className='overflow-x-auto'>
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
                {records.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{format(record.date.toDate(), 'PPP')}</TableCell>
                    <TableCell>{translatePeriod(record.period)}</TableCell>
                    <TableCell>${record.total.toFixed(2)}</TableCell>
                    <TableCell>
                    <Badge variant={getStatusVariant(translateStatus(record.status))} className={
                        record.status === 'Posted' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'Ready for Posting' ? 'bg-green-100 text-green-800' : 
                        record.status === 'Pending Matching' ? 'bg-yellow-100 text-yellow-800' : 
                        record.status === 'Pending Upload' ? 'bg-gray-100 text-gray-800' : ''
                    }>
                        {translateStatus(record.status)}
                    </Badge>
                    </TableCell>
                    <TableCell>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/reports/cashier-sales?id=${record.id}`}>
                                <Printer className="ml-2 h-4 w-4"/>
                                عرض وطباعة
                            </Link>
                        </Button>
                    </TableCell>
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
