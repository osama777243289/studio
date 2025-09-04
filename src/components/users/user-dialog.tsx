

"use client"

import { useEffect, useMemo, useState } from 'react';
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
import type { User, UserRole, UserPermissions } from '@/app/(main)/users/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { Account } from '../chart-of-accounts/account-tree';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Role } from '@/lib/firebase/firestore/roles';

const pagePermissionSchema = z.object({ view: z.boolean().optional(), create: z.boolean().optional(), edit: z.boolean().optional(), delete: z.boolean().optional(), export: z.boolean().optional(), managePermissions: z.boolean().optional() });

const permissionsSchema = z.object({
    pages: z.object({
        dashboard: pagePermissionSchema.optional(),
        income: pagePermissionSchema.optional(),
        expenses: pagePermissionSchema.optional(),
        sales: pagePermissionSchema.optional(),
        chartOfAccounts: pagePermissionSchema.optional(),
        cashFlow: pagePermissionSchema.optional(),
        reports: pagePermissionSchema.optional(),
        users: pagePermissionSchema.optional(),
        roles: pagePermissionSchema.optional(),
        dataSettings: pagePermissionSchema.optional(),
    }).optional(),
    accounts: z.array(z.string()).optional(),
}).optional();


const createUserSchema = (isEditMode: boolean, accounts: Account[]) => z.object({
    name: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل." }),
    email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
    mobile: z.string().min(9, { message: "رقم الجوال إلزامي ويجب أن يكون صالحًا." }),
    password: z.string().min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل.").optional().or(z.literal('')),
    confirmPassword: z.string().min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل.").optional().or(z.literal('')),
    type: z.enum(['regular', 'employee'], { required_error: 'نوع المستخدم مطلوب' }),
    role: z.array(z.string()).min(1, { message: "يجب تحديد دور واحد على الأقل" }),
    status: z.enum(['نشط', 'غير نشط'], { required_error: 'حالة المستخدم مطلوبة' }),
    permissions: permissionsSchema,
    employeeAccountId: z.string().optional(),
}).refine(data => {
    if (isEditMode && !data.password) {
        return true; // Password is not being changed
    }
    return data.password === data.confirmPassword
}, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
}).superRefine((data, ctx) => {
    if (data.type === 'employee' && data.employeeAccountId) {
        const findAccount = (searchAccounts: Account[], id: string): Account | null => {
            for (const account of searchAccounts) {
                if (account.id === id) return account;
                if (account.children) {
                    const found = findAccount(account.children, id);
                    if (found) return found;
                }
            }
            return null;
        }
        
        const account = findAccount(accounts, data.employeeAccountId);
        
        // A simple check if the user name is included in the account name.
        // E.g. "راتب الموظف أحمد" includes "أحمد"
        if (account && !account.name.includes(data.name)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `يجب أن يتطابق اسم المستخدم مع اسم الموظف في الحساب المختار (الحساب الحالي: "${account.name}")`,
                path: ["name"],
            });
        }
    }
});


export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user: User | null;
  mode: 'add' | 'edit';
  accounts: Account[];
  roles: Role[];
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
    roles: { page: 'الأدوار', actions: { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف' } },
    dataSettings: { page: 'إعدادات البيانات', actions: { view: 'عرض' } },
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


export function UserDialog({ isOpen, onClose, onSave, user, mode, accounts, roles }: UserDialogProps) {
  const userSchema = useMemo(() => createUserSchema(mode === 'edit', accounts), [mode, accounts]);
  
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
        email: '',
        permissions: { pages: {}, accounts: [] },
        role: [],
    }
  });

  const userType = watch('type');

  const employeeAccounts = useMemo(() => {
    const findEmployeeAccounts = (accs: Account[]): Account[] => {
      let results: Account[] = [];
      for (const acc of accs) {
        if (acc.classifications?.includes('موظف')) {
          results.push(acc);
        }
        if (acc.children) {
          results = [...results, ...findEmployeeAccounts(acc.children)];
        }
      }
      return results;
    };
    return findEmployeeAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        reset({ 
            name: user.name, 
            email: user.email,
            mobile: user.mobile,
            password: '',
            confirmPassword: '',
            type: user.type,
            role: user.role, 
            status: user.status,
            permissions: user.permissions as any,
            employeeAccountId: user.employeeAccountId,
        });
      } else {
        reset({ 
            name: '', 
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            type: 'regular',
            role: [], 
            status: 'نشط',
            permissions: { pages: {}, accounts: [] },
            employeeAccountId: undefined
        });
      }
    }
  }, [user, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    if (data.type !== 'employee') {
        data.employeeAccountId = undefined;
    }
    onSave(data);
    onClose();
  };
  
  const renderRow = (label: string, id: string, children: React.ReactNode, error?: {message?: string} ) => (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={id} className="text-right pt-2 text-sm md:text-base">
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
                    {renderRow("رقم الجوال (للدخول)", "mobile", <Input id="mobile" {...register("mobile")} className="w-full ltr" />, errors.mobile)}
                    {renderRow("كلمة السر", "password", <Input id="password" type="password" {...register("password")} className="w-full ltr" placeholder={mode === 'edit' ? 'اتركه فارغاً لعدم التغيير' : ''} />, errors.password)}
                    {renderRow("تأكيد كلمة السر", "confirmPassword", <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="w-full ltr" />, errors.confirmPassword)}

                    {renderRow("نوع المستخدم", "type", (
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="regular" id="regular" />
                                        <Label htmlFor="regular">مستخدم عادي</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="employee" id="employee" />
                                        <Label htmlFor="employee">موظف</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    ), errors.type)}

                    {userType === 'employee' && renderRow("حساب الموظف", "employeeAccountId", (
                        <Controller
                            name="employeeAccountId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر حساب الموظف..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employeeAccounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name} ({acc.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    ))}
                    
                    {renderRow("الدور", "role", (
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                               <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-md border p-2">
                                  {roles.map((role: Role) => (
                                      <div key={role.id} className="flex items-center gap-2">
                                          <Checkbox
                                            id={`role-${role.id}`}
                                            checked={field.value?.includes(role.name)}
                                            onCheckedChange={(checked) => {
                                                const newValue = checked
                                                    ? [...(field.value || []), role.name]
                                                    : (field.value || []).filter((value) => value !== role.name);
                                                field.onChange(newValue);
                                            }}
                                          />
                                          <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                                      </div>
                                  ))}
                               </div>
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
                                                        name={`permissions.pages.${pageKey}.${actionKey}` as any}
                                                        control={control}
                                                        defaultValue={false}
                                                        render={({ field }) => (
                                                             <Checkbox
                                                                checked={field.value}
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
