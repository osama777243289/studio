
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog, AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';
import { addAccount, deleteAccount, getAccounts, updateAccount } from '@/lib/firebase/firestore/accounts';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    const { toast } = useToast();
    
    const refreshAccounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedAccounts = await getAccounts();
            setAccounts(fetchedAccounts);
        } catch (e: any) {
            console.error("Failed to fetch accounts:", e);
            setError("فشل الاتصال بـ Firestore. يرجى التحقق من إعدادات مشروع Firebase وقواعد الأمان. قد لا تكون قاعدة البيانات قد تم إنشاؤها أو أنها لا تسمح بالقراءة.");
            setAccounts([]); // Clear accounts on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAccounts();
    }, []);

    const findAccount = (id: string, accs: Account[]): Account | undefined => {
        for (const acc of accs) {
            if (acc.id === id) return acc;
            if (acc.children) {
                const found = findAccount(id, acc.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    const handleAddAccount = (parentId: string | null = null) => {
        const parent = parentId ? findAccount(parentId, accounts) : null;

        if (parent) {
            const level = parent.code.length === 1 ? 2 : parent.code.length === 4 ? 3 : 4;
            if (level >= 4) {
                 toast({
                    title: "لا يمكن الإضافة",
                    description: "لا يمكن إضافة حساب فرعي تحت حساب من المستوى الرابع (تحليلي).",
                    variant: "destructive"
                });
                return;
            }
        }
        
        setDialogMode(parentId ? 'addSub' : 'add');
        setSelectedAccount(null);
        setParentAccount(parent || null);
        setIsAddEditDialogOpen(true);
    };

    const handleEditAccount = (account: Account) => {
        const parent = account.parentId ? findAccount(account.parentId, accounts) : null;
        setDialogMode('edit');
        setSelectedAccount(account);
        setParentAccount(parent || null);
        setIsAddEditDialogOpen(true);
    };

    const handleDeleteAccount = (account: Account) => {
        if (account.children && account.children.length > 0) {
            toast({
                title: "فشل الحذف",
                description: "لا يمكن حذف حساب يحتوي على حسابات فرعية. يرجى حذف الحسابات الفرعية أولاً.",
                variant: "destructive"
            });
            return;
        }
        setSelectedAccount(account);
        setIsDeleteDialogOpen(true);
    };

    const confirmSave = async (accountData: AccountFormData) => {
        try {
            setLoading(true);
            const isNew = dialogMode !== 'edit';
            const parentId = accountData.parentId || null;

            if (isNew && !parentId) {
                toast({ title: "خطأ", description: "يجب اختيار حساب أب عند إضافة حساب جديد.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const checkResult = await (isNew ? 
                addAccount(accountData, parentId) : 
                updateAccount(selectedAccount!.id, accountData));

            if (!checkResult.success) {
                toast({ title: "فشل الحفظ", description: checkResult.message, variant: "destructive" });
            } else {
                 toast({ title: "نجاح", description: isNew ? "تمت إضافة الحساب بنجاح." : "تم تحديث الحساب بنجاح." });
                 setIsAddEditDialogOpen(false);
                 await refreshAccounts();
            }
        } catch (e: any) {
            console.error("Failed to save account:", e);
            toast({ title: "خطأ في حفظ الحساب", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;
        try {
            setLoading(true);
            await deleteAccount(selectedAccount.id);
            toast({ title: "نجاح", description: `تم حذف الحساب "${selectedAccount.name}".` });
            setIsDeleteDialogOpen(false);
            await refreshAccounts();
        } catch (e: any) {
            console.error("Failed to delete account:", e);
            toast({ title: "خطأ في حذف الحساب", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <CardTitle className="font-headline">دليل الحسابات</CardTitle>
                  <CardDescription>تصفح وإدارة شجرة الحسابات الخاصة بك.</CardDescription>
              </div>
              <div className='flex gap-2 w-full sm:w-auto'>
                  <Button variant="outline" onClick={refreshAccounts} disabled={loading} className="flex-1 sm:flex-initial">
                      {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
                      تحديث
                  </Button>
                  <Button onClick={() => handleAddAccount()} className="flex-1 sm:flex-initial">
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة حساب جديد
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {error && (
             <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ في الاتصال</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
           )}
          <div className="border rounded-md p-2 sm:p-4 min-h-[400px] flex items-center justify-center overflow-x-auto">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>جاري تحميل الحسابات...</p>
                </div>
            ) : accounts.length > 0 ? (
                <AccountTree 
                    accounts={accounts} 
                    onAddSubAccount={(parentId) => handleAddAccount(parentId)}
                    onEditAccount={handleEditAccount}
                    onDeleteAccount={handleDeleteAccount}
                />
            ) : !error ? (
                 <div className="text-center text-muted-foreground">
                    <p>لم يتم العثور على حسابات.</p>
                    <p>انقر على "إضافة حساب جديد" للبدء.</p>
                </div>
            ) : null}
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
        account={selectedAccount}
        parentAccount={parentAccount}
        mode={dialogMode}
        allAccounts={accounts}
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
