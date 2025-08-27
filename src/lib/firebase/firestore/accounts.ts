
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
        code: '1', name: 'الأصول', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [], parentId: null,
        children: [
            { code: '11', name: 'الأصول المتداولة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [], parentId: null },
            { code: '12', name: 'الأصول الثابتة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Fixed Assets'], parentId: null },
        ],
    },
    {
        code: '2', name: 'الخصوم', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [], parentId: null,
        children: [
            { code: '21', name: 'الخصوم المتداولة', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [], parentId: null },
        ]
    },
    {
        code: '3', name: 'حقوق الملكية', type: 'Credit', group: 'Equity', status: 'Active', closingType: 'Balance Sheet', classifications: [], parentId: null },
    {
        code: '4', name: 'الإيرادات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'], parentId: null },
    {
        code: '5', name: 'المصروفات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'], parentId: null },
];

// Seed the database with default accounts
const seedAccounts = async () => {
    const batch = writeBatch(db);
    const accountsCol = collection(db, 'accounts');
    const rootDocs: { [key: string]: string } = {};

    // Create root accounts first
    for (const account of defaultAccounts) {
        const newDocRef = doc(accountsCol);
        rootDocs[account.code] = newDocRef.id;
        const { children, ...accountData } = account;
        batch.set(newDocRef, { ...accountData, parentId: null });
    }

    // Create child accounts
    for (const account of defaultAccounts) {
        if (account.children) {
            const parentId = rootDocs[account.code];
            for (const child of account.children) {
                const newChildDocRef = doc(accountsCol);
                const { children: _, ...childData } = child; // remove children prop if any
                batch.set(newChildDocRef, { ...childData, parentId });
            }
        }
    }
    
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

// Helper function to check for uniqueness
async function isAccountUnique(name: string, code: string, currentAccountId?: string): Promise<{ unique: boolean; message: string }> {
    const accountsCol = collection(db, 'accounts');
    const nameQuery = query(accountsCol, where("name", "==", name));
    const codeQuery = query(accountsCol, where("code", "==", code));

    const [nameSnapshot, codeSnapshot] = await Promise.all([getDocs(nameQuery), getDocs(codeQuery)]);

    const nameExists = !nameSnapshot.empty && (nameSnapshot.docs[0].id !== currentAccountId);
    if (nameExists) {
        return { unique: false, message: `اسم الحساب "${name}" موجود بالفعل.` };
    }

    const codeExists = !codeSnapshot.empty && (codeSnapshot.docs[0].id !== currentAccountId);
    if (codeExists) {
        return { unique: false, message: `رمز الحساب "${code}" موجود بالفعل.` };
    }

    return { unique: true, message: "" };
}


// Add a new account
export const addAccount = async (accountData: AccountFormData, parentId: string | null): Promise<{ success: boolean; message: string; accountId?: string }> => {
  const uniqueness = await isAccountUnique(accountData.name, accountData.code);
  if (!uniqueness.unique) {
      return { success: false, message: uniqueness.message };
  }

  const accountsCol = collection(db, 'accounts');
  const { parentId: dataParentId, ...restOfData } = accountData; // Separate parentId
  const newAccountData: any = {
    ...restOfData,
    parentId: parentId || null,
  };

  try {
    const newDocRef = await addDoc(accountsCol, newAccountData);
    return { success: true, message: "تمت الإضافة بنجاح.", accountId: newDocRef.id };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// Update an existing account
export const updateAccount = async (accountId: string, accountData: Partial<AccountFormData>): Promise<{ success: boolean; message: string }> => {
  if (!accountData.name || !accountData.code) {
     return { success: false, message: "الاسم والرمز مطلوبان." };
  }
  const uniqueness = await isAccountUnique(accountData.name, accountData.code, accountId);
  if (!uniqueness.unique) {
      return { success: false, message: uniqueness.message };
  }

  const accountRef = doc(db, 'accounts', accountId);
  try {
    await updateDoc(accountRef, accountData);
    return { success: true, message: "تم التحديث بنجاح." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};


// Delete an account (and its children recursively)
export const deleteAccount = async (accountId: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const accountsCol = collection(db, "accounts");
        
        const childrenQuery = query(accountsCol, where("parentId", "==", accountId));
        const childrenSnapshot = await getDocs(childrenQuery);

        if (!childrenSnapshot.empty) {
            throw new Error("لا يمكن حذف حساب يحتوي على حسابات فرعية. يرجى حذف الحسابات الفرعية أولاً.");
        }
        
        const accountToDeleteRef = doc(accountsCol, accountId);
        transaction.delete(accountToDeleteRef);
    });
};
