
import { db } from '@/lib/firebase/client';
import { RoleFormData } from '@/components/roles/role-dialog';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

export interface Role {
  id: string;
  name: string;
}

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  const rolesCol = collection(db, 'roles');
  const q = query(rolesCol, orderBy('name'));
  const roleSnapshot = await getDocs(q);
  if (roleSnapshot.empty) {
    return [];
  }
  return roleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
};

// Add a new role
export const addRole = async (roleData: RoleFormData): Promise<string> => {
  const rolesCol = collection(db, 'roles');
  const newDocRef = await addDoc(rolesCol, roleData);
  return newDocRef.id;
};

// Update an existing role
export const updateRole = async (roleId: string, roleData: Partial<RoleFormData>): Promise<void> => {
  const roleRef = doc(db, 'roles', roleId);
  await updateDoc(roleRef, roleData);
};

// Delete a role
export const deleteRole = async (roleId: string): Promise<void> => {
  const roleRef = doc(db, 'roles', roleId);
  await deleteDoc(roleRef);
};
