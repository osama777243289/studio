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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Account } from './account-tree';

const accountSchema = z.object({
    name: z.string().min(3, { message: "يجب أن يكون اسم الحساب 3 أحرف على الأقل." }),
    code: z.string().min(4, { message: "يجب أن يكون رمز الحساب 4 أرقام على الأقل." }).regex(/^\d+$/, { message: "يجب أن يحتوي الرمز على أرقام فقط."}),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  account: Account | null;
  mode: 'add' | 'edit' | 'addSub';
}

const titles = {
    add: 'إضافة حساب رئيسي جديد',
    edit: 'تعديل الحساب',
    addSub: 'إضافة حساب فرعي جديد'
}

export function AccountDialog({ isOpen, onClose, onSave, account, mode }: AccountDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    if (account && mode === 'edit') {
      reset({ name: account.name, code: account.code });
    } else {
      reset({ name: '', code: '' });
    }
  }, [account, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<AccountFormData> = (data) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>{titles[mode]}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                        الرمز
                    </Label>
                    <div className="col-span-3">
                        <Input id="code" {...register("code")} className="w-full" />
                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        الاسم
                    </Label>
                     <div className="col-span-3">
                        <Input id="name" {...register("name")} className="w-full" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
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
