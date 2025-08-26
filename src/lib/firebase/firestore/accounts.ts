
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
  const newAccountRef = doc(accountsCol); // Create a reference to get the ID
  
  const newAccountData: Omit<Account, 'id' | 'children'> & {parentId?: string | null} = {
    ...accountData,
    parentId: parentId || null,
  };

  await runTransaction(db, async (transaction) => {
     transaction.set(newAccountRef, newAccountData);
  });

  return newAccountRef.id;
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

        // Firestore queries are not supported inside transactions. This is a limitation.
        // We will perform the check outside the transaction. A better solution would involve a Cloud Function.
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
    { code: '1', name: 'الأصول', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '2', name: 'الخصوم', type: 'دائن', group: 'الخصوم', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '3', name: 'حقوق الملكية', type: 'دائن', group: 'حقوق الملكية', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '4', name: 'الإيرادات', type: 'دائن', group: 'الإيرادات', status: 'نشط', closingType: 'قائمة الدخل', classifications: [] },
    { code: '5', name: 'المصروفات', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: [] },
    
    // L2 under 1
    { code: '11', name: 'الأصول المتداولة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '12', name: 'الأصول الثابتة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },

    // L3 under 11
    { code: '1101', name: 'النقدية وما في حكمها', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '1102', name: 'الذمم المدينة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '1103', name: 'حسابات الشبكة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },

    // L4 under 1101
    { code: '1101001', name: 'صندوق المحل', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },
    { code: '1101002', name: 'بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['بنك'] },
    { code: '1101003', name: 'صندوق الخزنة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },

    // L4 under 1102
    { code: '1102001', name: 'العميل محمد', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['عملاء'] },
    { code: '1102002', name: 'العميل شركة الأمل', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['عملاء'] },

    // L4 under 1103
    { code: '1103001', name: 'شبكة مدى - بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['شبكات'] },
    { code: '1103002', name: 'شبكة فيزا - بنك الأهلي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['شبكات'] },

    // L3 under 12
    { code: '1201', name: 'الأراضي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },
    { code: '1202', name: 'السيارات', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: [] },

    // L4 under 1202
    { code: '1202001', name: 'سيارة هيونداي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['اصول ثابتة'] },

    // L2 under 5
    { code: '51', name: 'مصروفات التشغيل', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: [] },
    
    // L3 under 51
    { code: '5101', name: 'الرواتب', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: [] },

    // L4 under 5101
    { code: '5101001', name: 'راتب الموظف أحمد', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['مصروفات', 'موظف'] },
    { code: '5101002', name: 'راتب الموظف علي', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['مصروفات', 'موظف'] },
];

export const seedInitialData = async (): Promise<void> => {
    try {
        const accountsCol = collection(db, 'accounts');
        const batch = writeBatch(db);
        const codeToIdMap = new Map<string, string>();

        // First pass: Add all accounts and map their codes to their new Firestore IDs
        for (const accountData of initialChartOfAccountsData) {
            const newDocRef = doc(accountsCol);
            const parentCode = accountData.code.length === 1 ? null : (accountData.code.length === 2 ? accountData.code.substring(0, 1) : (accountData.code.length === 4 ? accountData.code.substring(0, 2) : accountData.code.substring(0, 4)));

            const dataToSet = {
                ...accountData,
                parentId: parentCode // Will be replaced by ID later, but helps identify hierarchy
            };
            batch.set(newDocRef, dataToSet);
            codeToIdMap.set(accountData.code, newDocRef.id);
        }

        // Commit the first batch to create all documents
        await batch.commit();

        // Second pass: Update documents with parentId
        const updateBatch = writeBatch(db);
        const snapshot = await getDocs(accountsCol);

        snapshot.docs.forEach(document => {
            const data = document.data();
            const code = data.code as string;
            let parentId = null;

            if (code.length > 1) {
                let parentCode = '';
                if (code.length === 2) parentCode = code.substring(0, 1);
                else if (code.length === 4) parentCode = code.substring(0, 2);
                else if (code.length === 7) parentCode = code.substring(0, 4);

                if (parentCode && codeToIdMap.has(parentCode)) {
                    parentId = codeToIdMap.get(parentCode);
                }
            }
            
            updateBatch.update(document.ref, { parentId: parentId });
        });
        
        await updateBatch.commit();

        console.log("Initial data seeded successfully!");
    } catch (error) {
        console.error("Error seeding data: ", error);
        throw error;
    }
};
