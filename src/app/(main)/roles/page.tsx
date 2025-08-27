
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, RefreshCw, AlertCircle } from "lucide-react"
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
// import { getRoles, addRole, updateRole, deleteRole } from '@/lib/firebase/firestore/roles';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Demo Data ---
const sampleRoles: Role[] = [
    { id: '1', name: 'المدير العام' },
    { id: '2', name: 'محاسب' },
    { id: '3', name: 'كاشير' },
    { id: '4', name: 'مدير فرع' },
];
// ---

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRoles = async () => {
        setLoading(true);
        setError("Failed to connect to Firestore. The app is currently running in offline demo mode. Your entries will not be saved.");
        setTimeout(() => {
            setRoles(sampleRoles);
            setLoading(false);
            toast({ title: "Demo Mode Active", description: "Displaying sample role data." });
        }, 500);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleAddRole = () => {
        toast({ title: "Demo Mode Active", description: "Cannot add roles in demo mode.", variant: "destructive"});
    };

    const handleEditRole = (role: Role) => {
        toast({ title: "Demo Mode Active", description: "Cannot edit roles in demo mode.", variant: "destructive"});
    };

    const handleDeleteRole = (role: Role) => {
        toast({ title: "Demo Mode Active", description: "Cannot delete roles in demo mode.", variant: "destructive"});
    };

    const confirmSave = async (roleData: RoleFormData) => {
        toast({ title: "Demo Mode Active", description: "Cannot save roles in demo mode.", variant: "destructive"});
        setIsDialogOpen(false);
    };

    const confirmDelete = async () => {
        toast({ title: "Demo Mode Active", description: "Cannot delete roles in demo mode.", variant: "destructive"});
        setIsDeleteDialogOpen(false);
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
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error - Demo Mode</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
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
