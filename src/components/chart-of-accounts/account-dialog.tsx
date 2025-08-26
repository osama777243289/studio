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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Account } from './account-tree';
import { cn } from '@/lib/utils';

const accountSchema = z.object({
    name: z.string().min(3, { message: "يجب أن يكون اسم الحساب 3 أحرف على الأقل." }),
    code: z.string().min(4, { message: "يجب أن يكون رمز الحساب 4 أرقام على الأقل." }).regex(/^\d+$/, { message: "يجب أن يحتوي الرمز على أرقام فقط."}),
    type: z.enum(['مدين', 'دائن'], { required_error: 'نوع الحساب مطلوب' }),
    group: z.enum(['الأصول', 'الخصوم', 'حقوق الملكية', 'الإيرادات', 'المصروفات'], { required_error: 'مجموعة الحساب مطلوبة' }),
    status: z.enum(['نشط', 'غير نشط'], { required_error: 'حالة الحساب مطلوبة' }),
});

export type AccountFormData = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  account: Account | null;
  parentAccount: Account | null;
  mode: 'add' | 'edit' | 'addSub';
}

const titles = {
    add: 'إضافة حساب رئيسي جديد',
    edit: 'تعديل الحساب',
    addSub: 'إضافة حساب فرعي جديد'
}

export function AccountDialog({ isOpen, onClose, onSave, account, parentAccount, mode }: AccountDialogProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (account && mode === 'edit') {
        reset({ name: account.name, code: account.code, type: account.type, group: account.group, status: account.status });
      } else {
        reset({ name: '', code: '', type: 'مدين', group: 'الأصول', status: 'نشط' });
      }
    }
  }, [account, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<AccountFormData> = (data) => {
    onSave(data);
    onClose();
  };
  
  const renderRow = (label: string, id: string, children: React.ReactNode, error?: {message?: string} ) => (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={id} className="text-right">
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>{titles[mode]}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {parentAccount && renderRow("حساب الأب", "parent", <Input id="parent" value={`${parentAccount.name} (${parentAccount.code})`} readOnly disabled />) }
                {renderRow("الرمز", "code", <Input id="code" {...register("code")} className="w-full" />, errors.code)}
                {renderRow("الاسم", "name", <Input id="name" {...register("name")} className="w-full" />, errors.name)}
                {renderRow("نوع الحساب", "type", (
                    <Select value={control._getWatch('type')} onValueChange={(value) => control._formValues.type = value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="مدين">مدين</SelectItem>
                            <SelectItem value="دائن">دائن</SelectItem>
                        </SelectContent>
                    </Select>
                ), errors.type)}
                {renderRow("مجموعة الحساب", "group", (
                     <Select value={control._getWatch('group')} onValueChange={(value) => control._formValues.group = value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="الأصول">الأصول</SelectItem>
                            <SelectItem value="الخصوم">الخصوم</SelectItem>
                            <SelectItem value="حقوق الملكية">حقوق الملكية</SelectItem>
                            <SelectItem value="الإيرادات">الإيرادات</SelectItem>
                            <SelectItem value="المصروفات">المصروفات</SelectItem>
                        </SelectContent>
                    </Select>
                ), errors.group)}
                 {renderRow("حالة الحساب", "status", (
                     <Select value={control._getWatch('status')} onValueChange={(value) => control._formValues.status = value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="نشط">نشط</SelectItem>
                            <SelectItem value="غير نشط">غير نشط</SelectItem>
                        </SelectContent>
                    </Select>
                ), errors.status)}
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
