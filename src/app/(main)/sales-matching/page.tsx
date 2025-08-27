
'use client';

import { useState, useEffect } from 'react';
import { MatchingForm } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';
import { getSalesRecordsByStatus, SalesRecord } from '@/lib/firebase/firestore/sales';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SalesMatchingPage() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const pendingRecords = await getSalesRecordsByStatus('Pending Matching');
        setRecords(pendingRecords);
        if (pendingRecords.length > 0) {
            setSelectedRecord(pendingRecords[0]);
        }
      } catch (error) {
        console.error("Failed to fetch pending sales records:", error);
      } finally {
        setLoading(false);
      }
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
