
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
import { type Role, getRoles, addRole, updateRole, deleteRole } from '@/lib/firebase/firestore/roles';
import { useToast } from '@/hooks/use-toast';

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const { toast } = useToast();

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const fetchedRoles = await getRoles();
            setRoles(fetchedRoles);
        } catch (error) {
             console.error("Failed to fetch roles:", error);
            toast({
                title: "Error",
                description: "Could not fetch roles from the database.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

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
        try {
            if (dialogMode === 'edit' && selectedRole) {
                await updateRole(selectedRole.id, roleData);
                toast({ title: "Role Updated", description: `Role "${roleData.name}" was successfully updated.` });
            } else {
                await addRole(roleData);
                toast({ title: "Role Added", description: `Role "${roleData.name}" was successfully created.` });
            }
            fetchRoles();
        } catch (error) {
            console.error("Failed to save role:", error);
            toast({ title: "Save Failed", description: "An error occurred while saving the role.", variant: "destructive" });
        } finally {
            setIsDialogOpen(false);
            setSelectedRole(null);
        }
    };

    const confirmDelete = async () => {
        if (!selectedRole) return;
        try {
           await deleteRole(selectedRole.id);
           toast({ title: "Role Deleted", description: `Role "${selectedRole.name}" was deleted.` });
           fetchRoles();
        } catch (error) {
            console.error("Failed to delete role:", error);
            toast({ title: "Delete Failed", description: "An error occurred while deleting the role.", variant: "destructive" });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedRole(null);
        }
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
