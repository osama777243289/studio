import { db } from '@/lib/firebase/client';
import { AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { Account } from '@/components/chart-of-accounts/account-tree';
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  getDoc,
  orderBy
} from 'firebase/firestore';


// Function to build a nested tree from a flat list of accounts
const buildAccountTree = (accounts: Account[]): Account[] => {
  const accountMap = new Map<string, Account>();
  const rootAccounts: Account[] = [];

  // First pass: create a map of all accounts
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account, children: [] });
  });

  // Second pass: build the tree structure
  accounts.forEach(account => {
    if (account.parentId) {
      const parent = accountMap.get(account.parentId);
      if (parent) {
        parent.children?.push(accountMap.get(account.id)!);
      }
    } else {
      rootAccounts.push(accountMap.get(account.id)!);
    }
  });
  
  const sortChildren = (node: Account) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => a.code.localeCompare(b.code));
      node.children.forEach(sortChildren);
    }
  };

  rootAccounts.sort((a, b) => a.code.localeCompare(b.code));
  rootAccounts.forEach(sortChildren);

  return rootAccounts;
};

// Get all accounts and structure them as a tree
export const getAccounts = async (): Promise<Account[]> => {
  const accountsCol = collection(db, 'accounts');
  const q = query(accountsCol, orderBy("code"));
  const accountSnapshot = await getDocs(q);
  const accounts: Account[] = accountSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
  return buildAccountTree(accounts);
};

// Add a new account
export const addAccount = async (accountData: AccountFormData, parentId: string | null): Promise<string> => {
  const accountsCol = collection(db, 'accounts');
  const newAccountData: Omit<Account, 'id' | 'children'> = {
    ...accountData,
    parentId: parentId || null,
  };
  const docRef = await addDoc(accountsCol, newAccountData);
  return docRef.id;
};

// Update an existing account
export const updateAccount = async (accountId: string, accountData: Partial<AccountFormData>): Promise<void> => {
  const accountRef = doc(db, 'accounts', accountId);
  await updateDoc(accountRef, accountData);
};

// Delete an account (and its children recursively)
export const deleteAccount = async (accountId: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const accountsCol = collection(db, "accounts");
        const accountToDeleteRef = doc(accountsCol, accountId);
        const accountToDeleteSnap = await transaction.get(accountToDeleteRef);

        if (!accountToDeleteSnap.exists()) {
            throw new Error("Account does not exist!");
        }

        // Check for children
        const childrenQuery = query(accountsCol, where("parentId", "==", accountId));
        const childrenSnapshot = await getDocs(childrenQuery); // Note: getDocs is not a transaction operation, this is a limitation

        if (!childrenSnapshot.empty) {
            throw new Error("Cannot delete an account with sub-accounts.");
        }
        
        transaction.delete(accountToDeleteRef);
    });
};
