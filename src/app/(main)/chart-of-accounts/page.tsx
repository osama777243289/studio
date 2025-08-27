
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
import { PlusCircle, FileDown, Loader2, RefreshCw } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog, AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';
import { addAccount, deleteAccount, getAccounts, updateAccount, seedInitialData } from '@/lib/firebase/firestore/accounts';


// Helper function to find an account in the tree
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

// Helper function to find the parent of an account
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


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            let fetchedAccounts = await getAccounts();
            // If no accounts, seed the data
            if (fetchedAccounts.length === 0) {
                await seedInitialData();
                fetchedAccounts = await getAccounts();
            }
            setAccounts(fetchedAccounts);
        } catch (error) {
            console.error("Failed to fetch or seed accounts:", error);
            // Optionally, show a toast notification
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const refreshAccounts = async () => {
        setLoading(true);
        const fetchedAccounts = await getAccounts();
        setAccounts(fetchedAccounts);
        setLoading(false);
    };

    const handleAddAccount = (parentId: string | null = null, parentLevel: number = 0) => {
        if (parentLevel >= 4) {
            alert("Cannot add a sub-account deeper than the fourth level.");
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

    const confirmSave = async (accountData: AccountFormData) => {
        const parentId = (dialogMode === 'addSub' || (dialogMode === 'edit' && parentAccount)) ? parentAccount?.id : null;
        try {
            if (dialogMode === 'edit' && selectedAccount) {
                 await updateAccount(selectedAccount.id, accountData);
            } else {
                 await addAccount(accountData, parentId);
            }
            await refreshAccounts();
        } catch (error) {
            console.error("Failed to save account:", error);
            alert("Failed to save account. Please try again.");
        } finally {
            setIsAddEditDialogOpen(false);
            setSelectedAccount(null);
            setParentAccount(null);
        }
    };

    const confirmDelete = async () => {
        if (selectedAccount) {
            try {
                await deleteAccount(selectedAccount.id);
                await refreshAccounts();
            } catch (error) {
                 console.error("Failed to delete account:", error);
                 alert("Failed to delete account. It may contain sub-accounts.");
            }
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
                  <CardTitle className="font-headline">Chart of Accounts</CardTitle>
                  <CardDescription>Browse and manage your accounting tree from Firestore.</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline" onClick={refreshAccounts} disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
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
          <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading accounts from Firestore...</p>
                </div>
            ) : accounts.length > 0 ? (
                <AccountTree 
                    accounts={accounts} 
                    onAddSubAccount={handleAddAccount}
                    onEditAccount={handleEditAccount}
                    onDeleteAccount={handleDeleteAccount}
                />
            ) : (
                 <div className="text-center text-muted-foreground">
                    <p>No accounts found.</p>
                    <p>Click "Add Main Account" to get started.</p>
                </div>
            )}
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
