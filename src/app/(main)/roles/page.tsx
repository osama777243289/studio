
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleDialog, type RoleFormData } from '@/components/roles/role-dialog';
import { DeleteRoleDialog } from '@/components/roles/delete-role-dialog';
import { type Role } from '@/lib/firebase/firestore/roles';

const initialRoles: Role[] = [
    { id: '1', name: 'Admin' },
    { id: '2', name: 'Cashier' },
    { id: '3', name: 'Accountant' },
    { id: '4', name: 'Data Entry' }
];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

    const fetchRoles = async () => {
        setLoading(true);
        setTimeout(() => {
            setRoles(initialRoles);
            setLoading(false);
            alert("This is a demo. Data is not fetched from a server.");
        }, 500);
    };

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

    const confirmSave = async (roleData: RoleFormData) => {
        alert("This is a demo. Your changes will not be saved.");
        setIsDialogOpen(false);
        setSelectedRole(null);
    };

    const confirmDelete = async () => {
        if (selectedRole) {
           alert("This is a demo. Your changes will not be saved.");
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
                            <CardDescription>إضافة وتعديل وحذف أدوار المستخدمين في النظام. (وضع العرض)</CardDescription>
                        </div>
                         <div className="flex gap-2">
                             <Button variant="outline" onClick={fetchRoles} disabled={loading}>
                                <RefreshCw className="ml-2 h-4 w-4" />
                                تحديث
                            </Button>
                            <Button onClick={handleAddRole}>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                إضافة دور جديد
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
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
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                            لم يتم العثور على أدوار. ابدأ بإضافة دور جديد.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((role) => (
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
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
