
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
  if (accountSnapshot.empty) {
      return [];
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
        const accountToDeleteRef = doc(accountsCol, accountId);
        
        // This query must be performed outside the transaction.
        const childrenQuery = query(accountsCol, where("parentId", "==", accountId));
        const childrenSnapshot = await getDocs(childrenQuery);

        if (!childrenSnapshot.empty) {
            throw new Error("Cannot delete an account with sub-accounts.");
        }
        
        transaction.delete(accountToDeleteRef);
    });
};


// The initial data that was previously hardcoded
const initialChartOfAccountsData: Omit<Account, 'id' | 'children'>[] = [
    // L1
    { code: '1', name: 'Assets', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '2', name: 'Liabilities', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '3', name: 'Equity', type: 'Credit', group: 'Equity', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '4', name: 'Revenues', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: [] },
    { code: '5', name: 'Expenses', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: [] },
    
    // L2 under 1
    { code: '11', name: 'Current Assets', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '12', name: 'Fixed Assets', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },

    // L3 under 11
    { code: '1101', name: 'Cash and Equivalents', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '1102', name: 'Accounts Receivable', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '1103', name: 'Network Accounts', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },

    // L4 under 1101
    { code: '1101001', name: 'Shop Cashbox', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Cashbox'] },
    { code: '1101002', name: 'Al-Rajhi Bank', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Bank'] },
    { code: '1101003', name: 'Safe Cashbox', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Cashbox'] },

    // L4 under 1102
    { code: '1102001', name: 'Client Mohammed', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Clients'] },
    { code: '1102002', name: 'Client Al-Amal Co.', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Clients'] },

    // L4 under 1103
    { code: '1103001', name: 'Mada Network - Al-Rajhi', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Networks'] },
    { code: '1103002', name: 'Visa Network - Al-Ahli', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Networks'] },

    // L3 under 12
    { code: '1201', name: 'Land', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },
    { code: '1202', name: 'Vehicles', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [] },

    // L4 under 1202
    { code: '1202001', name: 'Hyundai Car', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Fixed Assets'] },

    // L2 under 5
    { code: '51', name: 'Operating Expenses', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: [] },
    
    // L3 under 51
    { code: '5101', name: 'Salaries', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: [] },

    // L4 under 5101
    { code: '5101001', name: 'Salary Employee Ahmed', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses', 'Employee'] },
    { code: '5101002', name: 'Salary Employee Ali', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses', 'Employee'] },
];

const getParentCode = (code: string): string | null => {
    if (code.length === 1) return null;
    if (code.length === 2) return code.substring(0, 1);
    if (code.length === 4) return code.substring(0, 2);
    if (code.length === 7) return code.substring(0, 4);
    return null;
};


export const seedInitialData = async (): Promise<void> => {
    try {
        const accountsCol = collection(db, 'accounts');
        const batch = writeBatch(db);
        const codeToIdMap = new Map<string, string>();

        // Create docs and map codes to IDs first
        initialChartOfAccountsData.forEach(accountData => {
            const newDocRef = doc(accountsCol);
            codeToIdMap.set(accountData.code, newDocRef.id);
        });
        
        // Now set the data with the correct parentId
        initialChartOfAccountsData.forEach(accountData => {
            const docId = codeToIdMap.get(accountData.code)!;
            const parentCode = getParentCode(accountData.code);
            const parentId = parentCode ? codeToIdMap.get(parentCode) : null;
            
            const docRef = doc(accountsCol, docId);
            const dataToSet = {
                ...accountData,
                parentId: parentId
            };
            batch.set(docRef, dataToSet);
        });

        await batch.commit();
        console.log("Initial data seeded successfully!");

    } catch (error) {
        console.error("Error seeding data: ", error);
        throw error;
    }
};
