

'use client';

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
  where,
  setDoc
} from 'firebase/firestore';


const defaultUsers: Omit<User, 'id'>[] = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        mobile: '1234567890',
        type: 'regular',
        role: ['Admin'],
        status: 'نشط',
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
            accounts: ['*']
        },
        avatarUrl: `https://picsum.photos/seed/admin/40/40`,
    }
];

const seedUsers = async () => {
    const batch = writeBatch(db);
    const usersCol = collection(db, 'users');
    const defaultUser = defaultUsers[0];
    
    const q = query(usersCol, where("email", "==", defaultUser.email));
    const existingUserSnap = await getDocs(q);
    if (existingUserSnap.empty) {
        const newDocRef = doc(usersCol);
        batch.set(newDocRef, defaultUser);
        await batch.commit();
        console.log("Default admin user seeded to Firestore.");
    }
};


// Get all users
export const getUsers = async (): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('name'));
  const userSnapshot = await getDocs(q);
  
  if (userSnapshot.empty) {
    console.log("No users found. Seeding database...");
    await seedUsers();
    const seededSnapshot = await getDocs(q);
    return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
  
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

// Add a new user
export const addUser = async (userData: UserFormData): Promise<string> => {
    const usersCol = collection(db, 'users');
    // Note: We are not storing the password. This is insecure.
    // For a real app, hash the password before storing.
    const { confirmPassword, password, ...dataToSave } = userData;

    if (dataToSave.type !== 'employee') {
      delete dataToSave.employeeAccountId;
    }

    const newUser: Omit<User, 'id'> = {
        ...dataToSave,
        permissions: dataToSave.permissions || {},
        role: dataToSave.role || [],
        avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/40/40`,
    } as Omit<User, 'id'>;

    const newDocRef = await addDoc(usersCol, newUser);
    return newDocRef.id;
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  // Note: We are not storing the password. This is insecure.
  const { confirmPassword, password, ...dataToSave } = userData;
  
  if (dataToSave.type !== 'employee') {
    delete dataToSave.employeeAccountId;
  }

  await updateDoc(userRef, dataToSave as any);
};


// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};
