
"use client"

import { useEffect, useMemo } from 'react';
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
import type { Account } from './account-tree';
import { accountClassifications, closingAccountTypes } from './account-tree';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';


const createAccountSchema = (parentCode?: string) => {
    let level = 0;
    if (parentCode) {
        if (parentCode.length === 1) level = 1;
        else if (parentCode.length === 2) level = 2;
        else if (parentCode.length === 4) level = 3;
    }
    
    const levelLengths = [1, 2, 4, 7];
    const expectedLength = level < 4 ? levelLengths[level + 1] : -1;
    const currentLength = levelLengths[level];

    let codeSchema = z.string().regex(/^\d+$/, { message: "يجب أن يحتوي الرمز على أرقام فقط."});

    if (parentCode) {
        codeSchema = codeSchema.min(expectedLength, { message: `يجب أن يكون طول الرمز ${expectedLength} رقمًا.` })
            .max(expectedLength, { message: `يجب أن يكون طول الرمز ${expectedLength} رقمًا.` })
            .refine(code => code.startsWith(parentCode), { message: `يجب أن يبدأ الرمز برمز الأب (${parentCode})` });
    } else {
        // This is a root account (Level 1)
        codeSchema = codeSchema.min(1, { message: "يجب أن يكون طول الرمز رقمًا واحدًا." })
                               .max(1, { message: "يجب أن يكون طول الرمز رقمًا واحدًا." });
    }

    return z.object({
        name: z.string().min(3, { message: "يجب أن يكون اسم الحساب 3 أحرف على الأقل." }),
        code: codeSchema,
        type: z.enum(['مدين', 'دائن'], { required_error: 'نوع الحساب مطلوب' }),
        group: z.enum(['الأصول', 'الخصوم', 'حقوق الملكية', 'الإيرادات', 'المصروفات'], { required_error: 'مجموعة الحساب مطلوبة' }),
        status: z.enum(['نشط', 'غير نشط'], { required_error: 'حالة الحساب مطلوبة' }),
        closingType: z.string({ required_error: 'نوع الحساب الختامي مطلوب' }),
        classifications: z.array(z.string()).optional(),
    });
};


export type AccountFormData = z.infer<ReturnType<typeof createAccountSchema>>;

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

  const accountSchema = useMemo(() => {
    const code = mode === 'edit' ? parentAccount?.code : (mode === 'addSub' ? parentAccount?.code : undefined);
    return createAccountSchema(code);
  }, [mode, parentAccount, account]);


  const { register, handleSubmit, reset, control, formState: { errors }, watch } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
        classifications: []
    }
  });

  const selectedClassifications = watch('classifications') || [];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && account) {
        reset({ 
            name: account.name, 
            code: account.code, 
            type: account.type, 
            group: account.group, 
            status: account.status,
            closingType: account.closingType,
            classifications: account.classifications || []
        });
      } else if (mode === 'addSub' && parentAccount) {
         reset({ 
            name: '', 
            code: parentAccount.code, 
            type: parentAccount.type, 
            group: parentAccount.group, 
            status: 'نشط',
            closingType: parentAccount.closingType,
            classifications: parentAccount.classifications
        });
      }
      else {
        reset({ 
            name: '', 
            code: '', 
            type: 'مدين', 
            group: 'الأصول', 
            status: 'نشط',
            closingType: closingAccountTypes[0],
            classifications: []
        });
      }
    }
  }, [account, parentAccount, mode, reset, isOpen]);

  const onSubmit: SubmitHandler<AccountFormData> = (data) => {
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
                {parentAccount && renderRow("حساب الأب", "parent", <Input id="parent" value={`${parentAccount.name} (${parentAccount.code})`} readOnly disabled className="bg-muted/50" />) }
                {renderRow("الرمز", "code", <Input id="code" {...register("code")} className="w-full ltr" />, errors.code)}
                {renderRow("الاسم", "name", <Input id="name" {...register("name")} className="w-full" />, errors.name)}
                
                {renderRow("نوع الحساب", "type", (
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="مدين">مدين</SelectItem>
                                    <SelectItem value="دائن">دائن</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.type)}

                {renderRow("مجموعة الحساب", "group", (
                     <Controller
                        name="group"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="الأصول">الأصول</SelectItem>
                                    <SelectItem value="الخصوم">الخصوم</SelectItem>
                                    <SelectItem value="حقوق الملكية">حقوق الملكية</SelectItem>
                                    <SelectItem value="الإيرادات">الإيرادات</SelectItem>
                                    <SelectItem value="المصروفات">المصروفات</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.group)}

                {renderRow("نوع الحساب الختامي", "closingType", (
                     <Controller
                        name="closingType"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {closingAccountTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.closingType)}
                
                {renderRow("تصنيف الحساب", "classifications", (
                    <Controller
                        name="classifications"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between font-normal"
                                    >
                                    <span className="truncate">
                                      {selectedClassifications.length > 0 ? selectedClassifications.join(', ') : "اختر تصنيفًا..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                <ScrollArea className='h-72'>
                                  {accountClassifications.map((item) => (
                                    <div key={item} className="flex items-center space-x-2 space-x-reverse px-4 py-2">
                                      <Checkbox
                                        id={item}
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...(field.value || []), item]
                                            : (field.value || []).filter((value) => value !== item);
                                          field.onChange(newValue);
                                        }}
                                      />
                                      <Label htmlFor={item} className='w-full'>{item}</Label>
                                    </div>
                                  ))}
                                  </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                ), errors.classifications)}


                 {renderRow("حالة الحساب", "status", (
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

    