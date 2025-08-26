
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { SalesRecords } from '@/components/sales/sales-records';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useState } from 'react';

const initialChartOfAccountsData: Account[] = [
    {
        id: '1',
        code: '1',
        name: 'الأصول',
        type: 'مدين',
        group: 'الأصول',
        status: 'نشط',
        closingType: 'الميزانية العمومية',
        classifications: [],
        children: [
            {
                id: '1-1',
                code: '11',
                name: 'الأصول المتداولة',
                type: 'مدين',
                group: 'الأصول',
                status: 'نشط',
                closingType: 'الميزانية العمومية',
                classifications: [],
                children: [
                    {
                        id: '1-1-1',
                        code: '1101',
                        name: 'النقدية وما في حكمها',
                        type: 'مدين',
                        group: 'الأصول',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '1-1-1-1', code: '1101001', name: 'صندوق المحل', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },
                            { id: '1-1-1-2', code: '1101002', name: 'بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['بنك'] },
                            { id: '1-1-1-3', code: '1101003', name: 'صندوق الخزنة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },
                        ]
                    },
                    {
                        id: '1-1-2',
                        code: '1102',
                        name: 'الذمم المدينة',
                        type: 'مدين',
                        group: 'الأصول',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '1-1-2-1', code: '1102001', name: 'العميل محمد', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['عملاء'] },
                             { id: '1-1-2-2', code: '1102002', name: 'العميل شركة الأمل', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['عملاء'] },
                        ]
                    },
                     {
                        id: '1-1-3',
                        code: '1103',
                        name: 'حسابات الشبكة',
                        type: 'مدين',
                        group: 'الأصول',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '1-1-3-1', code: '1103001', name: 'شبكة مدى - بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['شبكات'] },
                             { id: '1-1-3-2', code: '1103002', name: 'شبكة فيزا - بنك الأهلي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['شبكات'] },
                        ]
                    },
                ],
            },
        ],
    },
];


export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>(initialChartOfAccountsData);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <SalesForm accounts={accounts}/>
      </div>
      <div className="space-y-8">
        <SalesRecords />
      </div>
    </div>
  );
}
