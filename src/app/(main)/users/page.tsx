
'use client';

import { useState } from 'react';
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
import { PlusCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDialog, type UserFormData } from '@/components/users/user-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';


export interface User {
    id: string;
    name: string;
    email: string;
    role: "مدير" | "محاسب" | "كاشير" | "مدخل بيانات";
    status: "نشط" | "غير نشط";
}


const initialUsers: User[] = [
  {
    id: "1",
    name: "يوسف خالد",
    email: "youssef.k@example.com",
    role: "مدير",
    status: "نشط",
  },
  {
    id: "2",
    name: "فاطمة علي",
    email: "fatima.ali@example.com",
    role: "محاسب",
    status: "نشط",
  },
  {
    id: "3",
    name: "أحمد منصور",
    email: "ahmed.m@example.com",
    role: "كاشير",
    status: "غير نشط",
  },
  {
    id: "4",
    name: "سارة إبراهيم",
    email: "sara.i@example.com",
    role: "مدخل بيانات",
    status: "نشط",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

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

  const confirmSave = (userData: UserFormData) => {
    if (dialogMode === 'add') {
      const newUser: User = { ...userData, id: Date.now().toString() };
      setUsers(prev => [...prev, newUser]);
    } else if (dialogMode === 'edit' && selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
    }
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
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
                  <CardTitle className="font-headline">دليل المستخدمين</CardTitle>
                  <CardDescription>إدارة المستخدمين والصلاحيات في النظام.</CardDescription>
              </div>
              <Button onClick={handleAddUser}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة مستخدم جديد
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage data-ai-hint="person avatar" src={`https://picsum.photos/id/${20 + index}/40/40`} alt="Avatar" />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'}
                      className={user.status === 'نشط' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>تعديل</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive">حذف</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={confirmSave}
        user={selectedUser}
        mode={dialogMode}
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
