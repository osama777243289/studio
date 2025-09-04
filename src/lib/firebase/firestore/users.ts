

import { db, auth } from '@/lib/firebase/client';
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
import { createUserWithEmailAndPassword, updatePassword, deleteUser as deleteAuthUser } from 'firebase/auth';


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
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, defaultUser.email!, "password");
        const user = userCredential.user;
        
        const newDocRef = doc(usersCol, user.uid);
        batch.set(newDocRef, defaultUser);
        await batch.commit();
        console.log("Default admin user has been seeded to Firestore and Auth.");

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Default admin user already exists in Firebase Auth.');
            // Check if user exists in Firestore
            const q = query(usersCol, where("email", "==", defaultUser.email));
            const existingUserSnap = await getDocs(q);
            if (existingUserSnap.empty) {
                 const newDocRef = doc(usersCol);
                 batch.set(newDocRef, defaultUser);
                 await batch.commit();
                 console.log("Default admin user seeded to Firestore.");
            }
        } else {
            console.error("Error seeding default user:", error);
        }
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
    if (!userData.email || !userData.password) {
        throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان لإنشاء مستخدم جديد.");
    }
    
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Step 2: Add user data to Firestore
    const usersCol = collection(db, 'users');
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

    // Use the UID from Auth as the document ID in Firestore for easy mapping
    const userDocRef = doc(usersCol, user.uid);
    await setDoc(userDocRef, newUser);

    return user.uid;
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  const { confirmPassword, password, ...dataToSave } = userData;
  
  // Update password in Firebase Auth if provided
  if (password && auth.currentUser) {
    // This requires reauthentication, which is complex for a server action.
    // For now, we assume the admin has rights to do this or we handle it differently.
    // A better approach would be a separate "change password" flow for the user.
    // As a simplification, we can't update other users' passwords directly this way.
    console.warn("Password update skipped. Requires re-authentication which is not implemented in this flow.");
  }
  
   if (dataToSave.type !== 'employee') {
    dataToSave.employeeAccountId = undefined;
  }

  await updateDoc(userRef, dataToSave as any);
};


// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  // Deleting user from Firestore
  await deleteDoc(userRef);

  // Deleting user from Firebase Auth is more complex and requires a backend environment
  // (like Cloud Functions) to manage users without re-authentication.
  // We will skip deleting from Auth here. The user will no longer be able to log in
  // because the middleware checks the Firestore document.
  console.warn(`User ${userId} deleted from Firestore. Associated Auth user was not deleted.`);
};

    