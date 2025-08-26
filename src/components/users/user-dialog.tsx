
"use client"

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User, UserPermissions } from '@/app/(main)/users/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { Account } from '../chart-of-accounts/account-tree';
import { ScrollArea } from '../ui/scroll-area';

const permissionsSchema = z.object({
    pages: z.object({
        dashboard: z.object({ view: z.boolean().optional() }).optional(),
        income: z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional() }).optional(),
        expenses: z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional() }).optional(),
        sales: z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional() }).optional(),
        chartOfAccounts: z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional() }).optional(),
        cashFlow: z.object({ view: z.boolean().optional(), create: z.boolean().optional() }).optional(),
        reports: z.object({ view: z.boolean().optional(), export: z.boolean().optional() }).optional(),
        users: z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional(), managePermissions: z.boolean().optional() }).optional(),
    }).optional(),
    accounts: z.array(z.string()).optional(),
}).optional();


const userSchema = z.object({
    name: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل." }),
    email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
    role: z.enum(['مدير', 'محاسب', 'كاشير', 'مدخل بيانات'], { required_error: 'دور المستخدم مطلوب' }),
    status: z.enum(['نشط', 'غير نشط'], { required_error: 'حالة المستخدم مطلوبة' }),
    permissions: permissionsSchema,
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user: User | null;
  mode: 'add' | 'edit';
  accounts: Account[];
}

const titles = {
    add: 'إضافة مستخدم جديد',
    edit: 'تعديل بيانات المستخدم',
}

const permissionLabels: { [key: string]: { page: string, actions: { [key: string]: string } } } = {
    dashboard: { page: 'لوحة التحكم', actions: { view: 'عرض' } },
    income: { page: 'الدخل', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف' } },
    expenses: { page: 'المصروفات', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف' } },
    sales: { page: 'المبيعات', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف' } },
    chartOfAccounts: { page: 'دليل الحسابات', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف' } },
    cashFlow: { page: 'التدفق النقدي', actions: { view: 'عرض', create: 'إنشاء توقع' } },
    reports: { page: 'التقارير', actions: { view: 'عرض', export: 'تصدير' } },
    users: { page: 'المستخدمين', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف', managePermissions: 'إدارة الصلاحيات' } },
};

function AccountPermissionsTree({ accounts, control, name }: { accounts: Account[], control: any, name: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    const accountIds = fields.map((f: any) => f.id);

    const handleCheck = (accountId: string, checked: boolean) => {
        if (checked) {
            append({ id: accountId });
        } else {
            const indexToRemove = accountIds.findIndex((id: string) => id === accountId);
            if(indexToRemove > -1) remove(indexToRemove);
        }
    };
    
    const renderTree = (nodes: Account[], level = 0) => {
        return nodes.map(account => (
            <div key={account.id} style={{ marginRight: `${level * 20}px` }}>
                <div className="flex items-center gap-2 my-1">
                    <Checkbox
                        id={`account-${account.id}`}
                        checked={accountIds.includes(account.id)}
                        onCheckedChange={(checked) => handleCheck(account.id, !!checked)}
                    />
                    <Label htmlFor={`account-${account.id}`}>{account.name} ({account.code})</Label>
                </div>
                {account.children && renderTree(account.children, level + 1)}
            </div>
        ));
    };

    return <ScrollArea className="h-72 w-full rounded-md border p-4">{renderTree(accounts)}</ScrollArea>;
}


export function UserDialog({ isOpen, onClose, onSave, user, mode, accounts }: UserDialogProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
        permissions: { pages: {}, accounts: [] }
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        reset({ 
            name: user.name, 
            email: user.email,
            role: user.role, 
            status: user.status,
            permissions: user.permissions,
        });
      } else {
        reset({ 
            name: '', 
            email: '',
            role: 'كاشير', 
            status: 'نشط',
            permissions: { pages: {}, accounts: [] }
        });
      }
    }
  }, [user, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    onSave(data);
    onClose();
  };
  
  const renderRow = (label: string, id: string, children: React.ReactNode, error?: {message?: string} ) => (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={id} className="text-right pt-2">
            {label}
        </Label>
        <div className="col-span-3">
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{titles[mode]}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                {/* User Details */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">بيانات المستخدم</h3>
                    {renderRow("الاسم", "name", <Input id="name" {...register("name")} className="w-full" />, errors.name)}
                    {renderRow("البريد الإلكتروني", "email", <Input id="email" {...register("email")} className="w-full ltr" />, errors.email)}
                    
                    {renderRow("الدور", "role", (
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="مدير">مدير</SelectItem>
                                        <SelectItem value="محاسب">محاسب</SelectItem>
                                        <SelectItem value="كاشير">كاشير</SelectItem>
                                        <SelectItem value="مدخل بيانات">مدخل بيانات</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    ), errors.role)}

                     {renderRow("الحالة", "status", (
                         <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                               <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="نشط">نشط</SelectItem>
                                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    ), errors.status)}
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">صلاحيات المستخدم</h3>
                    <Accordion type="multiple" className="w-full">
                        <AccordionItem value="page-permissions">
                            <AccordionTrigger>صلاحيات الواجهات</AccordionTrigger>
                            <AccordionContent>
                                {Object.entries(permissionLabels).map(([pageKey, pageInfo]) => (
                                    <div key={pageKey} className="mb-2 p-2 border rounded-md">
                                        <h4 className="font-semibold mb-2">{pageInfo.page}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                            {Object.entries(pageInfo.actions).map(([actionKey, actionLabel]) => (
                                                <div key={actionKey} className="flex items-center gap-2">
                                                    <Controller
                                                        name={`permissions.pages.${pageKey}.${actionKey}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                             <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    <Label>{actionLabel}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="account-permissions">
                            <AccordionTrigger>صلاحيات الحسابات</AccordionTrigger>
                            <AccordionContent>
                                <Controller
                                    name="permissions.accounts"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Checkbox 
                                                    id="all-accounts"
                                                    checked={field.value?.includes('*')}
                                                    onCheckedChange={(checked) => field.onChange(checked ? ['*'] : [])}
                                                />
                                                <Label htmlFor='all-accounts'>السماح بالوصول لجميع الحسابات</Label>
                                            </div>
                                            {!field.value?.includes('*') && (
                                                <AccountPermissionsTree accounts={accounts} control={control} name="permissions.accounts" />
                                            )}
                                        </>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">إلغاء</Button>
                </DialogClose>
                <Button type="submit">حفظ</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
