

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
        password: 'password123',
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

// Recursively removes undefined values from an object
const removeUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues);
    }

    if (typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (value !== undefined) {
                    newObj[key] = removeUndefinedValues(value);
                }
            }
        }
        return newObj;
    }

    return obj;
};

// Add a new user
export const addUser = async (userData: UserFormData): Promise<string> => {
    const usersCol = collection(db, 'users');
    const { confirmPassword, ...dataToSave } = userData;

    if (dataToSave.type !== 'employee') {
      delete dataToSave.employeeAccountId;
    }

    const cleanedPermissions = removeUndefinedValues(dataToSave.permissions);

    const newUser: Omit<User, 'id'> = {
        ...dataToSave,
        permissions: cleanedPermissions || {},
        role: dataToSave.role || [],
        avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/40/40`,
        password: dataToSave.password || '',
    } as Omit<User, 'id'>;

    const newDocRef = await addDoc(usersCol, newUser);
    return newDocRef.id;
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  const { confirmPassword, ...dataToSave } = userData;
  
  if (dataToSave.type !== 'employee') {
    delete dataToSave.employeeAccountId;
  }
  
  // Create a clean object for updating. If password is empty, don't update it.
  const updateData: { [key: string]: any } = removeUndefinedValues({ ...dataToSave });
  if (!updateData.password) {
      delete updateData.password;
  }


  await updateDoc(userRef, updateData);
};


// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};
