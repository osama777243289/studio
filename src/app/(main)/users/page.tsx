
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MoreHorizontal, Loader2, RefreshCw, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDialog, type UserFormData } from '@/components/users/user-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { getRoles, Role } from '@/lib/firebase/firestore/roles';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/firebase/firestore/users';


export interface PagePermissions {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    export?: boolean;
    managePermissions?: boolean;
}

export interface UserPermissions {
    pages?: {
        dashboard?: PagePermissions;
        income?: PagePermissions;
        expenses?: PagePermissions;
        sales?: PagePermissions;
        chartOfAccounts?: PagePermissions;
        cashFlow?: PagePermissions;
        reports?: PagePermissions;
        users?: PagePermissions;
    };
    accounts?: string[]; // Array of allowed account IDs
}

export type UserRole = string;

export interface User {
    id: string;
    name: string;
    email?: string;
    mobile: string;
    avatarUrl?: string;
    type: "regular" | "employee";
    role: UserRole[];
    status: "نشط" | "غير نشط";
    permissions: UserPermissions;
    employeeAccountId?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  
  const fetchData = async () => {
    setLoading(true);
    try {
        const [fetchedUsers, fetchedAccounts, fetchedRoles] = await Promise.all([
            getUsers(),
            getAccounts(),
            getRoles()
        ]);
        
        setUsers(fetchedUsers);
        setAccounts(fetchedAccounts);
        setRoles(fetchedRoles);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally show an error toast
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const handleAddUser = () => {
    setDialogMode('add');
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmSave = async (userData: UserFormData) => {
    try {
        if (dialogMode === 'add') {
            await addUser(userData);
        } else if (dialogMode === 'edit' && selectedUser) {
            await updateUser(selectedUser.id, userData);
        }
        await fetchData(); // Refresh data
    } catch (error) {
        console.error("Failed to save user:", error);
        alert("Failed to save user. Please try again.");
    } finally {
        setIsDialogOpen(false);
        setSelectedUser(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        await fetchData(); // Refresh data
      } catch (error) {
         console.error("Failed to delete user:", error);
         alert("Failed to delete user. Please try again.");
      }
    }
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Users Directory</CardTitle>
                  <CardDescription>Manage system users and permissions from Firestore.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className="ml-2 h-4 w-4" />
                    Refresh
                </Button>
                <Button onClick={handleAddUser}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    Add New User
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarImage data-ai-hint="person avatar" src={user.avatarUrl} alt="Avatar" />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-sm text-muted-foreground ltr">{user.mobile}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className='flex flex-wrap gap-1'>
                            {user.role.map(r => <Badge variant="secondary" key={r}>{r}</Badge>)}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}
                            className={user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                            >
                            {user.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                            <div className='flex items-center justify-end'>
                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                    <Pencil className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>

      <UserDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={confirmSave}
        user={selectedUser}
        mode={dialogMode}
        accounts={accounts}
        roles={roles}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        userName={selectedUser?.name}
      />
    </>
  )
}
