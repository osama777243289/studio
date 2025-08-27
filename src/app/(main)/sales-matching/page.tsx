
'use client';

import { useState, useEffect } from 'react';
import { MatchingForm } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';
// import { getSalesRecordsByStatus, SalesRecord } from '@/lib/firebase/firestore/sales';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SalesRecord } from '@/lib/firebase/firestore/sales';
import { Timestamp } from 'firebase/firestore';


// --- Demo Data ---
const sampleRecords: SalesRecord[] = [
    { 
        id: '1', 
        date: Timestamp.now(), 
        period: 'Morning', 
        cashier: 'أحمد', 
        total: 5500, 
        status: 'Pending Matching',
        cash: { accountId: 'c1', accountName: 'الصندوق الرئيسي', amount: 3000 },
        cards: [{ accountId: 'n1', accountName: 'شبكة مدى', amount: 2000 }],
        credits: [{ accountId: 'cl1', accountName: 'العميل خالد', amount: 500 }],
        createdAt: Timestamp.now(),
    },
    { 
        id: '2', 
        date: Timestamp.now(), 
        period: 'Evening', 
        cashier: 'فاطمة', 
        total: 7200, 
        status: 'Pending Matching',
        cash: { accountId: 'c1', accountName: 'الصندوق الرئيسي', amount: 4000 },
        cards: [{ accountId: 'n1', accountName: 'شبكة مدى', amount: 3200 }],
        credits: [],
        createdAt: Timestamp.now(),
    }
];
// ---

export default function SalesMatchingPage() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      // using sample data
      setRecords(sampleRecords);
      if (sampleRecords.length > 0) {
          setSelectedRecord(sampleRecords[0]);
      }
      setLoading(false);
    };
    fetchRecords();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        {loading ? (
             <Card>
                <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        ) : (
             <RecordsToMatch records={records} onSelectRecord={setSelectedRecord} selectedRecord={selectedRecord}/>
        )}
      </div>
      <div className="space-y-8">
        <MatchingForm record={selectedRecord} />
      </div>
    </div>
  );
}
