
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
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/app/(main)/users/page';

const userSchema = z.object({
    name: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل." }),
    email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
    role: z.enum(['مدير', 'محاسب', 'كاشير', 'مدخل بيانات'], { required_error: 'دور المستخدم مطلوب' }),
    status: z.enum(['نشط', 'غير نشط'], { required_error: 'حالة المستخدم مطلوبة' }),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user: User | null;
  mode: 'add' | 'edit';
}

const titles = {
    add: 'إضافة مستخدم جديد',
    edit: 'تعديل بيانات المستخدم',
}

export function UserDialog({ isOpen, onClose, onSave, user, mode }: UserDialogProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        reset({ 
            name: user.name, 
            email: user.email,
            role: user.role, 
            status: user.status,
        });
      } else {
        reset({ 
            name: '', 
            email: '',
            role: 'كاشير', 
            status: 'نشط',
        });
      }
    }
  }, [user, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    onSave(data);
    onClose();
  };
  
  const renderRow = (label: string, id: string, children: React.ReactNode, error?: {message?: string} ) => (
      <div className="grid grid-cols-4 items-start gap-4">
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{titles[mode]}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
