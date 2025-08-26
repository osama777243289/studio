
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog, AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';

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
                            { id: '1-1-1-2', code: '1101002', name: 'بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['بنك'] }
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
                        ]
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        code: '2',
        name: 'الخصوم',
        type: 'دائن',
        group: 'الخصوم',
        status: 'نشط',
        closingType: 'الميزانية العمومية',
        classifications: [],
        children: [
            {
                id: '2-1',
                code: '21',
                name: 'الخصوم المتداولة',
                type: 'دائن',
                group: 'الخصوم',
                status: 'نشط',
                closingType: 'الميزانية العمومية',
                classifications: [],
                children: [
                    {
                        id: '2-1-1',
                        code: '2101',
                        name: 'الذمم الدائنة',
                        type: 'دائن',
                        group: 'الخصوم',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '2-1-1-1', code: '2101001', name: 'المورد شركة الورود', type: 'دائن', group: 'الخصوم', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['موردين'] }
                        ]
                    }
                ],
            },
        ],
    },
    {
        id: '4',
        code: '4',
        name: 'الإيرادات',
        type: 'دائن',
        group: 'الإيرادات',
        status: 'نشط',
        closingType: 'قائمة الدخل',
        classifications: [],
        children: [
            {
                id: '4-1',
                code: '41',
                name: 'إيرادات النشاط الرئيسي',
                type: 'دائن',
                group: 'الإيرادات',
                status: 'نشط',
                closingType: 'قائمة الدخل',
                classifications: [],
                children: [
                    {
                        id: '4-1-1',
                        code: '4101',
                        name: 'مبيعات المنتجات',
                        type: 'دائن',
                        group: 'الإيرادات',
                        status: 'نشط',
                        closingType: 'قائمة الدخل',
                        classifications: [],
                        children: [
                            { id: '4-1-1-1', code: '4101001', name: 'مبيعات الزهور', type: 'دائن', group: 'الإيرادات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['ايرادات'] },
                        ]
                    }
                ]
            },
        ]
    },
    {
        id: '5',
        code: '5',
        name: 'المصروفات',
        type: 'مدين',
        group: 'المصروفات',
        status: 'نشط',
        closingType: 'قائمة الدخل',
        classifications: [],
        children: [
            {
                id: '5-1',
                code: '51',
                name: 'مصروفات التشغيل',
                type: 'مدين',
                group: 'المصروفات',
                status: 'نشط',
                closingType: 'قائمة الدخل',
                classifications: [],
                children: [
                    {
                        id: '5-1-1',
                        code: '5101',
                        name: 'الرواتب',
                        type: 'مدين',
                        group: 'المصروفات',
                        status: 'نشط',
                        closingType: 'قائمة الدخل',
                        classifications: [],
                        children: [
                            { id: '5-1-1-1', code: '5101001', name: 'راتب الموظف أحمد', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['مصروفات'] },
                        ]
                    }
                ]
            },
        ]
    },
];


// Helper function to find and manipulate an account in the tree
const findAndManipulateAccount = (
  accounts: Account[],
  accountId: string,
  action: 'add' | 'edit' | 'delete',
  payload?: Account | AccountFormData
): Account[] => {
  return accounts
    .map((acc) => {
      if (acc.id === accountId) {
        switch (action) {
          case 'add':
            return {
              ...acc,
              children: [...(acc.children || []), payload as Account],
            };
          case 'edit':
             return { ...acc, ...(payload as AccountFormData) };
          case 'delete':
            return null; // Will be filtered out
        }
      }
      if (acc.children) {
        return {
          ...acc,
          children: findAndManipulateAccount(acc.children, accountId, action, payload),
        };
      }
      return acc;
    })
    .filter((acc): acc is Account => acc !== null);
};


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(initialChartOfAccountsData);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    
    const handleAddAccount = (parentId: string | null = null, parentLevel: number = 0) => {
        if (parentLevel >= 4) {
            alert("لا يمكن إضافة حساب فرعي لمستوى أعمق من المستوى الرابع.");
            return;
        }
        setDialogMode(parentId ? 'addSub' : 'add');
        const pAccount = parentId ? findAccountById(accounts, parentId) : null;
        setParentAccount(pAccount)
        setSelectedAccount(pAccount); // In addSub mode, selected is the parent
        setIsAddEditDialogOpen(true);
    };

    const handleEditAccount = (account: Account) => {
        setDialogMode('edit');
        setSelectedAccount(account);
        const pAccount = findParentOf(accounts, account.id);
        setParentAccount(pAccount);
        setIsAddEditDialogOpen(true);
    };

    const handleDeleteAccount = (account: Account) => {
        setSelectedAccount(account);
        setIsDeleteDialogOpen(true);
    };

    const findAccountById = (searchAccounts: Account[], id: string): Account | null => {
        for (const account of searchAccounts) {
            if (account.id === id) return account;
            if (account.children) {
                const found = findAccountById(account.children, id);
                if (found) return found;
            }
        }
        return null;
    }

     const findParentOf = (searchAccounts: Account[], accountId: string, parent: Account | null = null): Account | null => {
        for(const account of searchAccounts){
            if(account.id === accountId) return parent;
            if(account.children){
                const found = findParentOf(account.children, accountId, account);
                if(found) return found;
            }
        }
        return null;
    }

    const confirmSave = (accountData: AccountFormData) => {
        if (dialogMode === 'add') {
             const newAccount: Account = { ...accountData, id: Date.now().toString(), children: [] };
             setAccounts(prev => [...prev, newAccount]);
        } else if (dialogMode === 'edit' && selectedAccount) {
            setAccounts(prev => findAndManipulateAccount(prev, selectedAccount.id, 'edit', accountData));
        } else if (dialogMode === 'addSub' && selectedAccount) {
            const newSubAccount: Account = { ...accountData, id: Date.now().toString(), children: [] };
            setAccounts(prev => findAndManipulateAccount(prev, selectedAccount.id, 'add', newSubAccount));
        }
        setIsAddEditDialogOpen(false);
        setSelectedAccount(null);
        setParentAccount(null);
    };

    const confirmDelete = () => {
        if (selectedAccount) {
            // A bit of a trick: we need to find the parent to call the manipulator function
            // This is a simplified approach. A real app might need a more robust way to find the parent.
            const deleteRecursively = (accounts: Account[], accountId: string): Account[] => {
                return accounts.filter(acc => acc.id !== accountId).map(acc => {
                    if (acc.children) {
                        acc.children = deleteRecursively(acc.children, accountId);
                    }
                    return acc;
                });
            }
            setAccounts(prev => deleteRecursively(prev, selectedAccount.id));
        }
        setIsDeleteDialogOpen(false);
        setSelectedAccount(null);
        setParentAccount(null);
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">دليل الحسابات</CardTitle>
                  <CardDescription>تصفح وقم بإدارة شجرة الحسابات المحاسبية الخاصة بك.</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline">
                      <FileDown className="ml-2 h-4 w-4" />
                      تصدير
                  </Button>
                  <Button onClick={() => handleAddAccount()}>
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة حساب رئيسي
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
              <AccountTree 
                accounts={accounts} 
                onAddSubAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
          </div>
        </CardContent>
      </Card>
      <AccountDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => {
            setIsAddEditDialogOpen(false);
            setSelectedAccount(null);
            setParentAccount(null);
        }}
        onSave={confirmSave}
        account={dialogMode === 'edit' ? selectedAccount : null}
        parentAccount={parentAccount}
        mode={dialogMode}
      />
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        accountName={selectedAccount?.name}
      />
    </>
  );
}

    