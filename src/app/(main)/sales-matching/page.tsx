
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

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const fetchedRecords = await getSalesRecordsByStatus('Pending Matching');
      setRecords(fetchedRecords);
      // Automatically select the first record if the list is not empty and no record is currently selected.
      if (fetchedRecords.length > 0 && !selectedRecord) {
          setSelectedRecord(fetchedRecords[0]);
      } else if (fetchedRecords.length === 0) {
          // Clear selection if no records are returned
          setSelectedRecord(null);
      }
    } catch (error) {
        console.error("Failed to fetch records for matching:", error);
        setRecords([]); // Clear records on error
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    fetchRecords();
    // The dependency array is intentionally empty to only run once on mount.
    // Refreshing is handled by onMatchSuccess.
  }, []);

  const handleMatchSuccess = () => {
      // Clear the selected record and refresh the list from firestore
      setSelectedRecord(null);
      fetchRecords();
  }

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
        <MatchingForm record={selectedRecord} onMatchSuccess={handleMatchSuccess} />
      </div>
    </div>
  );
}
