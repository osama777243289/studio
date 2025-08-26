
'use client';

import { useState } from 'react';
import { MatchingForm, type SalesRecord } from '@/components/sales-matching/matching-form';
import { RecordsToMatch } from '@/components/sales-matching/records-to-match';

const initialRecords: SalesRecord[] = [
  {
    date: 'يونيو 10, 2025',
    period: 'الصباحية',
    cashier: 'يوسف خالد',
    total: 3500.00,
    status: 'بانتظار المطابقة',
    cash: { name: 'صندوق المحل', amount: 1500 },
    cards: [
        { name: 'شبكة الراجحي', amount: 1000 },
        { name: 'شبكة الأهلي', amount: 500 },
    ],
    credits: [
        { name: 'العميل محمد', amount: 500 },
    ]
  },
  {
    date: 'يونيو 9, 2025',
    period: 'المسائية',
    cashier: 'أحمد منصور',
    total: 4200.00,
    status: 'بانتظار المطابقة',
    cash: { name: 'صندوق المحل', amount: 2200 },
    cards: [
        { name: 'شبكة الراجحي', amount: 2000 },
    ],
    credits: []
  },
];


export default function SalesMatchingPage() {
  const [records, setRecords] = useState<SalesRecord[]>(initialRecords);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(records[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <RecordsToMatch records={records} onSelectRecord={setSelectedRecord} selectedRecord={selectedRecord}/>
      </div>
      <div className="space-y-8">
        <MatchingForm record={selectedRecord} />
      </div>
    </div>
  );
}
