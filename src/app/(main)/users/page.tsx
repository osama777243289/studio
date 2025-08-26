
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
import { Account } from '@/components/chart-of-accounts/account-tree';


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

const initialChartOfAccountsData: Account[] = [
    {
        id: '1',
        code: '1',
        name: 'الأصول',
        type: 'مدين',
        group: 'الأصول',
        status: 'نشط',
        closingType: 'الميزانية العمومية',
        classifications: [],
        children: [
            {
                id: '1-1',
                code: '11',
                name: 'الأصول المتداولة',
                type: 'مدين',
                group: 'الأصول',
                status: 'نشط',
                closingType: 'الميزانية العمومية',
                classifications: [],
                children: [
                    {
                        id: '1-1-1',
                        code: '1101',
                        name: 'النقدية وما في حكمها',
                        type: 'مدين',
                        group: 'الأصول',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '1-1-1-1', code: '1101001', name: 'صندوق المحل', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },
                            { id: '1-1-1-2', code: '1101002', name: 'بنك الراجحي', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['بنك'] },
                            { id: '1-1-1-3', code: '1101003', name: 'صندوق الخزنة', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['صندوق'] },
                        ]
                    },
                    {
                        id: '1-1-2',
                        code: '1102',
                        name: 'الذمم المدينة',
                        type: 'مدين',
                        group: 'الأصول',
                        status: 'نشط',
                        closingType: 'الميزانية العمومية',
                        classifications: [],
                        children: [
                            { id: '1-1-2-1', code: '1102001', name: 'العميل محمد', type: 'مدين', group: 'الأصول', status: 'نشط', closingType: 'الميزانية العمومية', classifications: ['عملاء'] },
                        ]
                    },
                ],
            },
        ],
    },
     {
        id: '5',
        code: '5',
        name: 'المصروفات',
        type: 'مدين',
        group: 'المصروفات',
        status: 'نشط',
        closingType: 'قائمة الدخل',
        classifications: [],
        children: [
            {
                id: '5-1',
                code: '51',
                name: 'مصروفات التشغيل',
                type: 'مدين',
                group: 'المصروفات',
                status: 'نشط',
                closingType: 'قائمة الدخل',
                classifications: [],
                children: [
                    {
                        id: '5-1-1',
                        code: '5101',
                        name: 'الرواتب',
                        type: 'مدين',
                        group: 'المصروفات',
                        status: 'نشط',
                        closingType: 'قائمة الدخل',
                        classifications: [],
                        children: [
                            { id: '5-1-1-1', code: '5101001', name: 'راتب الموظف أحمد', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['مصروفات', 'موظف'] },
                            { id: '5-1-1-2', code: '5101002', name: 'راتب الموظف علي', type: 'مدين', group: 'المصروفات', status: 'نشط', closingType: 'قائمة الدخل', classifications: ['مصروفات', 'موظف'] },
                        ]
                    }
                ]
            },
        ]
    },
];

const initialUsers: User[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [accounts] = useState<Account[]>(initialChartOfAccountsData);
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
    const dataToSave: Partial<UserFormData> = { ...userData };
    // Don't save password if it's not changed in edit mode
    if (dialogMode === 'edit' && !dataToSave.password) {
        delete dataToSave.password;
    }
    delete dataToSave.confirmPassword;

    if (dialogMode === 'add') {
      const newUser: User = { 
        ...dataToSave, 
        id: Date.now().toString(), 
        permissions: dataToSave.permissions || {},
        role: dataToSave.role || [],
        avatarUrl: `https://picsum.photos/id/${25 + users.length}/40/40`
      } as User;
      setUsers(prev => [...prev, newUser]);
    } else if (dialogMode === 'edit' && selectedUser) {
       const updatedUser = { ...selectedUser, ...dataToSave, permissions: dataToSave.permissions || selectedUser.permissions, role: dataToSave.role || selectedUser.role };
       setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
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
        accounts={accounts}
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

    