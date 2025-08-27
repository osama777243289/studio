
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
            setError("Failed to connect to Firestore. Please check your Firebase project settings and security rules. The database might not be created or is not allowing reads.");
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
        setDialogMode(parentId ? 'addSub' : 'add');
        setSelectedAccount(null);
        const parent = parentId ? findAccount(parentId, accounts) : null;
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
                title: "Deletion Failed",
                description: "Cannot delete an account that has sub-accounts. Please delete the sub-accounts first.",
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
            if (dialogMode === 'edit' && selectedAccount) {
                await updateAccount(selectedAccount.id, accountData);
                toast({ title: "Success", description: "Account updated successfully." });
            } else {
                const parentId = parentAccount ? parentAccount.id : null;
                await addAccount(accountData, parentId);
                toast({ title: "Success", description: "Account added successfully." });
            }
            setIsAddEditDialogOpen(false);
            await refreshAccounts();
        } catch (e: any) {
            console.error("Failed to save account:", e);
            toast({ title: "Error Saving Account", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;
        try {
            setLoading(true);
            await deleteAccount(selectedAccount.id);
            toast({ title: "Success", description: `Account "${selectedAccount.name}" deleted.` });
            setIsDeleteDialogOpen(false);
            await refreshAccounts();
        } catch (e: any) {
            console.error("Failed to delete account:", e);
            toast({ title: "Error Deleting Account", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Chart of Accounts</CardTitle>
                  <CardDescription>Browse and manage your accounting tree.</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline" onClick={refreshAccounts} disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Refresh
                  </Button>
                  <Button onClick={() => handleAddAccount()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Main Account
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {error && (
             <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
           )}
          <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading Accounts...</p>
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
                    <p>No accounts found.</p>
                    <p>Click "Add Main Account" to get started.</p>
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
