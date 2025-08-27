
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

const defaultAccounts: (Omit<Account, 'id' | 'children'> & { children?: Omit<Account, 'id' | 'children'>[] })[] = [
    {
        code: '1', name: 'الأصول', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            { code: '11', name: 'الأصول المتداولة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
            { code: '12', name: 'الأصول الثابتة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Fixed Assets'] },
        ],
    },
    {
        code: '2', name: 'الخصوم', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            { code: '21', name: 'الخصوم المتداولة', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
        ]
    },
    {
        code: '3', name: 'حقوق الملكية', type: 'Credit', group: 'Equity', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    {
        code: '4', name: 'الإيرادات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'] },
    {
        code: '5', name: 'المصروفات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'] },
];

// Seed the database with default accounts
const seedAccounts = async () => {
    const batch = writeBatch(db);
    const accountsCol = collection(db, 'accounts');

    const addAccountsRecursively = (accounts: any[], parentId: string | null = null) => {
        accounts.forEach(account => {
            const newDocRef = doc(accountsCol);
            const { children, ...accountData } = account;
            batch.set(newDocRef, { ...accountData, parentId });
            if (children && children.length > 0) {
                addAccountsRecursively(children, newDocRef.id);
            }
        });
    };

    addAccountsRecursively(defaultAccounts);
    await batch.commit();
    console.log("Default accounts have been seeded to Firestore.");
};


// Function to build a nested tree from a flat list of accounts
const buildAccountTree = (accounts: any[]): Account[] => {
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

  // If no accounts exist, seed the database with defaults
  if (accountSnapshot.empty) {
      console.log("No accounts found. Seeding database...");
      await seedAccounts();
      // Fetch again after seeding
      const seededSnapshot = await getDocs(q);
      const accounts: any[] = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return buildAccountTree(accounts);
  }
  
  const accounts: any[] = accountSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return buildAccountTree(accounts);
};

// Add a new account
export const addAccount = async (accountData: AccountFormData, parentId: string | null): Promise<string> => {
  const accountsCol = collection(db, 'accounts');
  
  const newAccountData: any = { // Use any to include parentId
    ...accountData,
    parentId: parentId || null,
  };

  const newDocRef = await addDoc(accountsCol, newAccountData);
  return newDocRef.id;
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
        
        // This query must be performed outside the transaction to avoid limitations.
        const childrenQuery = query(accountsCol, where("parentId", "==", accountId));
        const childrenSnapshot = await getDocs(childrenQuery);

        if (!childrenSnapshot.empty) {
            // Instead of throwing an error, we can recursively delete children.
            // For simplicity in this app, we will prevent deletion.
            throw new Error("Cannot delete an account that has sub-accounts. Please delete the sub-accounts first.");
        }
        
        const accountToDeleteRef = doc(accountsCol, accountId);
        transaction.delete(accountToDeleteRef);
    });
};
