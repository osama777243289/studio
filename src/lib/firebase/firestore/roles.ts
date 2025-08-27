
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
  writeBatch,
} from 'firebase/firestore';

export interface Role {
  id: string;
  name: string;
}

const defaultRoles: Omit<Role, 'id'>[] = [
    { name: 'Admin' },
    { name: 'Accountant' },
    { name: 'Cashier' },
    { name: 'Data Entry' },
];

const seedRoles = async () => {
    const batch = writeBatch(db);
    const rolesCol = collection(db, 'roles');
    defaultRoles.forEach(role => {
        const newDocRef = doc(rolesCol);
        batch.set(newDocRef, role);
    });
    await batch.commit();
    console.log("Default roles have been seeded to Firestore.");
};

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  const rolesCol = collection(db, 'roles');
  const q = query(rolesCol, orderBy('name'));
  const roleSnapshot = await getDocs(q);

  if (roleSnapshot.empty) {
    console.log("No roles found. Seeding database...");
    await seedRoles();
    const seededSnapshot = await getDocs(q);
    return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
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
