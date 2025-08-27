
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
import { getSalesRecords, SalesRecord } from '@/lib/firebase/firestore/sales';
import { format } from 'date-fns';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Pending Upload':
            return 'secondary'
        case 'Pending Matching':
            return 'destructive'
        case 'Matched':
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
                const fetchedRecords = await getSalesRecords();
                setRecords(fetchedRecords);
            } catch (error) {
                console.error("Failed to fetch sales records:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Sales Records</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sales records found.</p>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{format(record.date.toDate(), 'PPP')}</TableCell>
                    <TableCell>{record.period}</TableCell>
                    <TableCell>${record.total.toFixed(2)}</TableCell>
                    <TableCell>
                    <Badge variant={getStatusVariant(record.status)} className={
                        record.status === 'Matched' ? 'bg-green-100 text-green-800' : 
                        record.status === 'Pending Matching' ? 'bg-yellow-100 text-yellow-800' : ''
                    }>
                        {record.status}
                    </Badge>
                    </TableCell>
                    <TableCell>
                        {record.status !== 'Pending Upload' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/reports/cashier-sales?id=${record.id}`}>
                                    <Printer className="mr-2 h-4 w-4"/>
                                    View & Print
                                </Link>
                            </Button>
                        )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
