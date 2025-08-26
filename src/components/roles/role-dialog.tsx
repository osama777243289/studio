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
import type { Role } from '@/app/(main)/roles/page';

const roleSchema = z.object({
    name: z.string().min(2, { message: "يجب أن يكون اسم الدور حرفين على الأقل." }),
});

export type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RoleFormData) => void;
  role: Role | null;
  mode: 'add' | 'edit';
}

const titles = {
    add: 'إضافة دور جديد',
    edit: 'تعديل الدور',
}

export function RoleDialog({ isOpen, onClose, onSave, role, mode }: RoleDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && role) {
        reset({ name: role.name });
      } else {
        reset({ name: '' });
      }
    }
  }, [role, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<RoleFormData> = (data) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>{titles[mode]}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        اسم الدور
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
