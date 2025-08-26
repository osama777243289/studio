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
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleDialog, type RoleFormData } from '@/components/roles/role-dialog';
import { DeleteRoleDialog } from '@/components/roles/delete-role-dialog';

export interface Role {
    id: string;
    name: string;
}

const initialRoles: Role[] = [
    { id: '1', name: 'مدير' },
    { id: '2', name: 'محاسب' },
    { id: '3', name: 'كاشير' },
    { id: '4', name: 'مدخل بيانات' }
];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

    const handleAddRole = () => {
        setDialogMode('add');
        setSelectedRole(null);
        setIsDialogOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setDialogMode('edit');
        setSelectedRole(role);
        setIsDialogOpen(true);
    };

    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteDialogOpen(true);
    };

    const confirmSave = (roleData: RoleFormData) => {
        if (dialogMode === 'add') {
            const newRole: Role = {
                id: Date.now().toString(),
                name: roleData.name,
            };
            setRoles(prev => [...prev, newRole]);
        } else if (dialogMode === 'edit' && selectedRole) {
            const updatedRole = { ...selectedRole, name: roleData.name };
            setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
        }
        setIsDialogOpen(false);
        setSelectedRole(null);
    };

    const confirmDelete = () => {
        if (selectedRole) {
            setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
        }
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">إدارة الأدوار</CardTitle>
                            <CardDescription>إضافة وتعديل وحذف أدوار المستخدمين في النظام.</CardDescription>
                        </div>
                        <Button onClick={handleAddRole}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            إضافة دور جديد
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>اسم الدور</TableHead>
                                <TableHead>
                                    <span className="sr-only">الإجراءات</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell className="text-left">
                                        <div className='flex items-center justify-end'>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <RoleDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={confirmSave}
                role={selectedRole}
                mode={dialogMode}
            />

            <DeleteRoleDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                roleName={selectedRole?.name}
            />
        </>
    );
}
