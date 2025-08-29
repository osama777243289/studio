
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
        code: '1', name: 'الأصول', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
        children: [
            { 
                code: '11', name: 'الأصول المتداولة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                children: [
                    { code: '1101', name: 'النقدية بالصناديق والبنوك', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                        children: [
                            { code: '1101001', name: 'صندوق الكاشير الرئيسي', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: ['كاشير', 'صندوق'], parentId: null, isSystemAccount: false },
                            { code: '1101002', name: 'حساب الشبكة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: ['شبكات'], parentId: null, isSystemAccount: false },
                        ]
                    },
                    { code: '1102', name: 'العملاء', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                        children: [
                            { code: '1102001', name: 'عميل مبيعات آجلة عام', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: ['عملاء'], parentId: null, isSystemAccount: false },
                        ]
                    },
                    { code: '1104', name: 'المخزون', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                        children: [
                            { code: '1104001', name: 'مخزون البضائع', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: ['مخزون'], parentId: null, isSystemAccount: true },
                        ]
                    },
                ] 
            },
            { code: '12', name: 'الأصول الثابتة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'الميزانية العمومية', classifications: ['أصول ثابتة'], parentId: null, isSystemAccount: true },
        ],
    },
    {
        code: '2', name: 'الخصوم', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
        children: [
            { 
                code: '21', name: 'الخصوم المتداولة', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                children: [
                    { code: '2101', name: 'ضريبة القيمة المضافة', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true,
                      children: [
                           { code: '2101001', name: 'ضريبة القيمة المضافة على المبيعات', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true },
                      ]
                    },
                ]
            },
        ]
    },
    {
        code: '3', name: 'حقوق الملكية', type: 'Credit', group: 'Equity', status: 'Active', closingType: 'الميزانية العمومية', classifications: [], parentId: null, isSystemAccount: true },
    {
        code: '4', name: 'الإيرادات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
         children: [
            { code: '41', name: 'إيرادات النشاط الرئيسي', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
              children: [
                  { code: '4101', name: 'إيرادات المبيعات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
                    children: [
                        { code: '4101001', name: 'إيراد مبيعات الفرع الرئيسي', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'قائمة الدخل', classifications: ['إيرادات'], parentId: null, isSystemAccount: true },
                    ]
                  },
              ]
            }
        ]
    },
    {
        code: '5', name: 'المصروفات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
        children: [
            { code: '51', name: 'تكلفة المبيعات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
               children: [
                   { code: '5101', name: 'تكلفة البضاعة المباعة', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true,
                     children: [
                         { code: '5101001', name: 'تكلفة مبيعات الفرع الرئيسي', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'قائمة الدخل', classifications: [], parentId: null, isSystemAccount: true },
                     ]
                   },
               ]
            }
        ]
    },
];

const seedAccounts = async () => {
    const batch = writeBatch(db);
    const accountsCol = collection(db, 'accounts');
    
    const addAccountRecursive = (account: any, parentId: string | null) => {
        const newDocRef = doc(accountsCol);
        const { children, ...accountData } = account;
        batch.set(newDocRef, { ...accountData, parentId });
        
        if (children) {
            children.forEach((child: any) => addAccountRecursive(child, newDocRef.id));
        }
    };

    defaultAccounts.forEach(account => addAccountRecursive(account, null));
    
    await batch.commit();
    console.log("Default accounts have been seeded to Firestore.");
};


const buildAccountTree = (accounts: Account[]): Account[] => {
  const accountMap = new Map<string, Account>();
  const rootAccounts: Account[] = [];

  // First, create a map of all accounts by their ID.
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account, children: [] });
  });

  // Then, iterate over the accounts again to build the tree.
  accounts.forEach(account => {
    const currentAccount = accountMap.get(account.id);
    if (!currentAccount) return;

    if (account.parentId && accountMap.has(account.parentId)) {
      const parent = accountMap.get(account.parentId);
      parent?.children?.push(currentAccount);
    } else {
      rootAccounts.push(currentAccount);
    }
  });
  
  // Helper function to sort children recursively
  const sortChildren = (node: Account) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => a.code.localeCompare(b.code));
      node.children.forEach(sortChildren);
    }
  };

  // Sort root accounts and then their children recursively
  rootAccounts.sort((a, b) => a.code.localeCompare(b.code));
  rootAccounts.forEach(sortChildren);

  return rootAccounts;
};

export const getAccounts = async (): Promise<Account[]> => {
    const accountsCol = collection(db, 'accounts');
    const q = query(accountsCol, orderBy("code"));
    let accountSnapshot = await getDocs(q);

    // If the database is empty, seed it with default accounts.
    if (accountSnapshot.empty) {
        console.log("No accounts found. Seeding database...");
        await seedAccounts();
        // Fetch the accounts again after seeding.
        accountSnapshot = await getDocs(q);
    }
    
    const accountsList = accountSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Account));
    
    return buildAccountTree(accountsList);
};


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

export const addAccount = async (accountData: AccountFormData, parentId: string | null): Promise<{ success: boolean; message: string; accountId?: string }> => {
  const uniqueness = await isAccountUnique(accountData.name, accountData.code);
  if (!uniqueness.unique) {
      return { success: false, message: uniqueness.message };
  }

  const accountsCol = collection(db, 'accounts');
  const { parentId: dataParentId, ...restOfData } = accountData;
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

export const deleteAccount = async (accountId: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const accountsCol = collection(db, "accounts");
        const accountRef = doc(accountsCol, accountId);
        const accountDoc = await transaction.get(accountRef);

        if (!accountDoc.exists() || accountDoc.data().isSystemAccount) {
            throw new Error("لا يمكن حذف حسابات النظام.");
        }
        
        const childrenQuery = query(accountsCol, where("parentId", "==", accountId));
        const childrenSnapshot = await getDocs(childrenQuery);

        if (!childrenSnapshot.empty) {
            throw new Error("لا يمكن حذف حساب يحتوي على حسابات فرعية. يرجى حذف الحسابات الفرعية أولاً.");
        }
        
        transaction.delete(accountRef);
    });
};
