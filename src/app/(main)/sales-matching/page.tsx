
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MatchingForm } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';
import { getSalesRecords, SalesRecord } from '@/lib/firebase/firestore/sales';
import { Loader2, CheckCheck, Hourglass, SendToBack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SalesMatchingPage() {
  const [allRecords, setAllRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const fetchedRecords = await getSalesRecords();
      setAllRecords(fetchedRecords);
      
      // If a record was selected, find it in the new list to keep it selected
      if (selectedRecord) {
        const stillExists = fetchedRecords.find(r => r.id === selectedRecord.id);
        if (!stillExists || stillExists.status !== 'Pending Matching') {
           setSelectedRecord(null); // Deselect if it's not pending anymore
        } else {
           setSelectedRecord(stillExists);
        }
      }

    } catch (error) {
        console.error("Failed to fetch records for matching:", error);
        setAllRecords([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { pendingRecords, readyForPostingRecords } = useMemo(() => {
    const pending = allRecords.filter(r => r.status === 'Pending Matching');
    const ready = allRecords.filter(r => r.status === 'Ready for Posting' || r.status === 'Posted');
    return { pendingRecords: pending, readyForPostingRecords: ready };
  }, [allRecords]);


  const handleMatchSuccess = () => {
      // Clear the selected record and refresh the list from firestore
      setSelectedRecord(null);
      fetchRecords();
  }
  
  const handleSelectRecord = (record: SalesRecord) => {
    // Only allow selecting pending records
    if(record.status === 'Pending Matching') {
        setSelectedRecord(record);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <MatchingForm record={selectedRecord} onMatchSuccess={handleMatchSuccess} />
      </div>
      <div className="space-y-8">
        {loading ? (
             <Card>
                <CardContent className="pt-6 flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        ) : (
            <>
                <RecordsToMatch 
                    title="سجلات قيد المطابقة"
                    description='اختر سجلاً من القائمة أدناه لبدء عملية المطابقة.'
                    icon={<Hourglass className="h-6 w-6 text-yellow-500" />}
                    records={pendingRecords} 
                    onSelectRecord={handleSelectRecord} 
                    selectedRecord={selectedRecord}
                />
                <RecordsToMatch 
                    title="سجلات جاهزة للترحيل ومؤرشفة"
                    description='سجلات المبيعات التي تمت مطابقتها أو ترحيلها.'
                    icon={<SendToBack className="h-6 w-6 text-green-500" />}
                    records={readyForPostingRecords} 
                    onSelectRecord={() => {}} // No-op for matched records
                    selectedRecord={null} // No selection for matched records table
                />
            </>
        )}
      </div>
    </div>
  );
}
