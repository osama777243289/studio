
"use client"

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from '../ui/badge';
import type { User, PagePermissions } from '@/app/(main)/users/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Account } from '../chart-of-accounts/account-tree';
import { ScrollArea } from '../ui/scroll-area';
import { CheckCircle2, XCircle } from 'lucide-react';


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

interface UserViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  accounts: Account[];
}

export function UserViewDialog({ isOpen, onClose, user, accounts }: UserViewDialogProps) {
  
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (accs: Account[]) => {
      for (const acc of accs) {
        map.set(acc.id, `${acc.name} (${acc.code})`);
        if (acc.children) {
          traverse(acc.children);
        }
      }
    };
    traverse(accounts);
    return map;
  }, [accounts]);

  if (!user) {
    return null;
  }

  const employeeAccountName = user.employeeAccountId ? accountMap.get(user.employeeAccountId) : 'N/A';

  const renderDetailRow = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-center py-2 border-b">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground text-left">{value}</dd>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تفاصيل المستخدم: {user.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
        <div className="space-y-6 pr-4">
            {/* Basic Info */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">البيانات الأساسية</h3>
                <dl>
                    {renderDetailRow("الاسم الكامل", user.name)}
                    {renderDetailRow("البريد الإلكتروني", user.email || 'غير متوفر')}
                    {renderDetailRow("رقم الجوال", <span className="ltr d-block">{user.mobile}</span>)}
                    {renderDetailRow("الحالة", 
                        <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'} className={user.status === 'نشط' ? 'bg-green-100 text-green-800' : ''}>
                            {user.status}
                        </Badge>
                    )}
                    {renderDetailRow("نوع المستخدم", user.type === 'employee' ? 'موظف' : 'مستخدم عادي')}
                    {user.type === 'employee' && renderDetailRow("حساب الموظف", employeeAccountName)}
                    {renderDetailRow("الأدوار", 
                        <div className="flex flex-wrap gap-1 justify-end">
                            {user.role.map(r => <Badge variant="secondary" key={r}>{r}</Badge>)}
                        </div>
                    )}
                </dl>
            </div>

            {/* Permissions */}
             <div className="space-y-2">
                <h3 className="font-semibold text-lg">الصلاحيات الممنوحة</h3>
                 <Accordion type="multiple" className="w-full">
                    <AccordionItem value="page-permissions">
                        <AccordionTrigger>صلاحيات الواجهات</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {Object.entries(permissionLabels).map(([pageKey, pageInfo]) => (
                                <div key={pageKey} className="p-2 border rounded-md">
                                    <h4 className="font-semibold mb-2">{pageInfo.page}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {Object.entries(pageInfo.actions).map(([actionKey, actionLabel]) => {
                                             const hasPermission = !!(user.permissions?.pages?.[pageKey as keyof typeof user.permissions.pages] as PagePermissions)?.[actionKey as keyof PagePermissions];
                                             return (
                                                <div key={actionKey} className="flex items-center gap-1.5 text-sm">
                                                   {hasPermission ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                                                   <span>{actionLabel}</span>
                                                </div>
                                             )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="account-permissions">
                        <AccordionTrigger>صلاحيات الحسابات</AccordionTrigger>
                        <AccordionContent>
                           {(user.permissions?.accounts?.includes('*')) ? (
                                <div className="flex items-center gap-2 text-sm p-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>يملك صلاحية الوصول إلى جميع الحسابات.</span>
                                </div>
                           ) : (user.permissions?.accounts && user.permissions.accounts.length > 0) ? (
                                <ul className="list-disc pr-6 space-y-1">
                                   {user.permissions.accounts.map(accountId => (
                                        <li key={accountId} className="text-sm">
                                            {accountMap.get(accountId) || `حساب غير معروف (ID: ${accountId})`}
                                        </li>
                                    ))}
                                </ul>
                           ) : (
                                <p className="text-sm text-muted-foreground p-2">لا توجد صلاحيات محددة على الحسابات.</p>
                           )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
        </ScrollArea>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">إغلاق</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
