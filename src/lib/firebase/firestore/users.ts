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
