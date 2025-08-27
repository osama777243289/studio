
import { db } from '@/lib/firebase/client';
import { UserFormData } from '@/components/users/user-dialog';
import { User } from '@/app/(main)/users/page';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';


// Get all users
export const getUsers = async (): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('name'));
  const userSnapshot = await getDocs(q);
  if (userSnapshot.empty) {
    return [];
  }
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

// Add a new user
export const addUser = async (userData: UserFormData): Promise<string> => {
  const usersCol = collection(db, 'users');
  
  // Remove password confirmation before saving
  const { confirmPassword, ...dataToSave } = userData;

  const newUser: Omit<User, 'id'> = {
    ...dataToSave,
    permissions: dataToSave.permissions || {},
    role: dataToSave.role || [],
    avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/40/40`
  } as Omit<User, 'id'>;


  const newDocRef = await addDoc(usersCol, newUser);
  return newDocRef.id;
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const { confirmPassword, ...dataToSave } = userData;
  // Do not save password if it's not changed
  if (dataToSave.password === '') {
      delete dataToSave.password;
  }
  await updateDoc(userRef, dataToSave);
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};


const initialUsers: Omit<User, 'id'>[] = [
  {
    name: "يوسف خالد",
    email: "youssef.k@example.com",
    mobile: "0501234567",
    avatarUrl: "https://picsum.photos/id/21/40/40",
    type: "regular",
    role: ["مدير"],
    status: "نشط",
    permissions: {
        pages: {
            dashboard: { view: true },
            income: { view: true, create: true, edit: true, delete: true },
            expenses: { view: true, create: true, edit: true, delete: true },
            sales: { view: true, create: true, edit: true, delete: true },
            chartOfAccounts: { view: true, create: true, edit: true, delete: true },
            cashFlow: { view: true, create: true },
            reports: { view: true, export: true },
            users: { view: true, create: true, edit: true, delete: true, managePermissions: true },
        },
        accounts: ['*'] // All accounts
    }
  },
  {
    name: "فاطمة علي",
    email: "fatima.ali@example.com",
    mobile: "0502345678",
    avatarUrl: "https://picsum.photos/id/22/40/40",
    type: "regular",
    role: ["محاسب"],
    status: "نشط",
    permissions: {
        pages: {
            dashboard: { view: true },
            income: { view: true, create: true, edit: true },
            expenses: { view: true, create: true, edit: true },
            sales: { view: true, create: true, edit: true },
            chartOfAccounts: { view: true, create: true, edit: true },
            cashFlow: { view: true },
            reports: { view: true, export: true },
            users: { view: true },
        },
        accounts: ['1', '2', '4', '5'] // Specific accounts
    }
  },
  {
    name: "أحمد منصور",
    email: "ahmed.m@example.com",
    mobile: "0503456789",
    avatarUrl: "https://picsum.photos/id/23/40/40",
    type: "regular",
    role: ["كاشير"],
    status: "غير نشط",
    permissions: {
        pages: {
            sales: { view: true, create: true },
        },
        accounts: ['1-1-1-1', '1-1-1-2']
    }
  },
  {
    name: "سارة إبراهيم",
    email: "sara.i@example.com",
    mobile: "0504567890",
    avatarUrl: "https://picsum.photos/id/24/40/40",
    type: "regular",
    role: ["مدخل بيانات"],
    status: "نشط",
    permissions: {
        pages: {
            income: { view: true, create: true },
            expenses: { view: true, create: true },
        },
        accounts: []
    }
  },
    {
    name: "علي عبدالله",
    email: "ali.a@example.com",
    mobile: "0505678901",
    avatarUrl: "https://picsum.photos/id/25/40/40",
    type: "employee",
    role: ["مدخل بيانات"],
    status: "نشط",
    permissions: {},
    employeeAccountId: '5-1-1-2'
  }
];


export const seedInitialUsers = async (): Promise<void> => {
    try {
        const usersCol = collection(db, 'users');
        const batch = writeBatch(db);

        initialUsers.forEach(userData => {
            const newDocRef = doc(usersCol);
            batch.set(newDocRef, userData);
        });

        await batch.commit();
        console.log("Initial users seeded successfully!");

    } catch (error) {
        console.error("Error seeding users: ", error);
        throw error;
    }
};
