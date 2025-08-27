
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
import { addAccount, deleteAccount, getAccounts, updateAccount } from '@/lib/firebase/firestore/accounts';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();
    
    const refreshAccounts = async () => {
        setLoading(true);
        try {
            const fetchedAccounts = await getAccounts();
            setAccounts(fetchedAccounts);
             toast({
                title: "Accounts Refreshed",
                description: "The chart of accounts has been updated.",
            });
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
            toast({
                title: "Error",
                description: "Could not fetch the latest accounts.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAccounts();
    }, []);

    const handleAddAccount = (parentId: string | null = null) => {
        const pAccount = parentId ? findAccountById(accounts, parentId) : null;
        const level = pAccount ? (pAccount.code.length === 1 ? 2 : (pAccount.code.length === 2 ? 3 : 4)) : 1;
        if (level > 4) {
            toast({
                title: "Cannot Add Account",
                description: "Cannot add a sub-account deeper than the fourth level.",
                variant: "destructive",
            });
            return;
        }
        setDialogMode(parentId ? 'addSub' : 'add');
        setParentAccount(pAccount)
        setSelectedAccount(null);
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
        if (account.children && account.children.length > 0) {
            toast({
                title: "Deletion Failed",
                description: "Cannot delete an account that has sub-accounts. Please delete the sub-accounts first.",
                variant: "destructive",
            });
            return;
        }
        setSelectedAccount(account);
        setIsDeleteDialogOpen(true);
    };

    const confirmSave = async (accountData: AccountFormData) => {
       try {
            if (dialogMode === 'edit' && selectedAccount) {
                await updateAccount(selectedAccount.id, accountData);
                toast({ title: "Account Updated", description: `Account "${accountData.name}" has been successfully updated.` });
            } else {
                const parentId = parentAccount ? parentAccount.id : null;
                await addAccount(accountData, parentId);
                toast({ title: "Account Added", description: `Account "${accountData.name}" has been successfully created.` });
            }
            refreshAccounts();
        } catch (error) {
            console.error("Failed to save account:", error);
            toast({ title: "Save Failed", description: "An error occurred while saving the account.", variant: "destructive" });
        } finally {
            setIsAddEditDialogOpen(false);
            setSelectedAccount(null);
            setParentAccount(null);
        }
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;
        try {
            await deleteAccount(selectedAccount.id);
            toast({ title: "Account Deleted", description: `Account "${selectedAccount.name}" has been deleted.` });
            refreshAccounts();
        } catch (error) {
            console.error("Failed to delete account:", error);
            const errorMessage = (error as Error).message || "An unexpected error occurred.";
            toast({ title: "Deletion Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedAccount(null);
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
                    <p>Loading accounts...</p>
                </div>
            ) : accounts.length > 0 ? (
                <AccountTree 
                    accounts={accounts} 
                    onAddSubAccount={(parentId) => handleAddAccount(parentId)}
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
