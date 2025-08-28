
'use client';

import { useState, useEffect } from 'react';
import { MatchingForm } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';
import { getSalesRecords, SalesRecord } from '@/lib/firebase/firestore/sales';
import { Loader2, CheckCheck, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SalesMatchingPage() {
  const [allRecords, setAllRecords] = useState<SalesRecord[]>([]);
  const [pendingRecords, setPendingRecords] = useState<SalesRecord[]>([]);
  const [matchedRecords, setMatchedRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const fetchedRecords = await getSalesRecords();
      setAllRecords(fetchedRecords);

      const pending = fetchedRecords.filter(r => r.status === 'Pending Matching');
      const matched = fetchedRecords.filter(r => r.status === 'Matched');

      setPendingRecords(pending);
      setMatchedRecords(matched);
      
      // Automatically select the first pending record if the list is not empty and no record is currently selected.
      if (pending.length > 0 && !selectedRecord) {
          setSelectedRecord(pending[0]);
      } else if (pending.length === 0) {
          setSelectedRecord(null);
      }

    } catch (error) {
        console.error("Failed to fetch records for matching:", error);
        setAllRecords([]);
        setPendingRecords([]);
        setMatchedRecords([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // The dependency array is intentionally empty to only run once on mount.
    // Refreshing is handled by onMatchSuccess.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                    title="سجلات مطابقة ومؤرشفة"
                    description='سجلات المبيعات التي تمت مطابقتها مسبقًا.'
                    icon={<CheckCheck className="h-6 w-6 text-green-500" />}
                    records={matchedRecords} 
                    onSelectRecord={() => {}} // No-op for matched records
                    selectedRecord={null} // No selection for matched records table
                />
            </>
        )}
      </div>
    </div>
  );
}
