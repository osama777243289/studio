
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

    let codeSchema = z.string().regex(/^\d+$/, { message: "Code must contain only digits."});

    if (parentCode) {
        codeSchema = codeSchema.min(expectedLength, { message: `Code must be ${expectedLength} digits long.` })
            .max(expectedLength, { message: `Code must be ${expectedLength} digits long.` })
            .refine(code => code.startsWith(parentCode), { message: `Code must start with the parent code (${parentCode})` });
    } else {
        // This is a root account (Level 1)
        codeSchema = codeSchema.min(1, { message: "Code must be 1 digit long." })
                               .max(1, { message: "Code must be 1 digit long." });
    }

    return z.object({
        name: z.string().min(3, { message: "Account name must be at least 3 characters." }),
        code: codeSchema,
        type: z.enum(['Debit', 'Credit'], { required_error: 'Account type is required' }),
        group: z.enum(['Assets', 'Liabilities', 'Equity', 'Revenues', 'Expenses'], { required_error: 'Account group is required' }),
        status: z.enum(['Active', 'Inactive'], { required_error: 'Account status is required' }),
        closingType: z.string({ required_error: 'Closing account type is required' }),
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
    add: 'Add New Main Account',
    edit: 'Edit Account',
    addSub: 'Add New Sub-Account'
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
            status: 'Active',
            closingType: parentAccount.closingType,
            classifications: parentAccount.classifications
        });
      }
      else {
        reset({ 
            name: '', 
            code: '', 
            type: 'Debit', 
            group: 'Assets', 
            status: 'Active',
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
                {parentAccount && renderRow("Parent Account", "parent", <Input id="parent" value={`${parentAccount.name} (${parentAccount.code})`} readOnly disabled className="bg-muted/50" />) }
                {renderRow("Code", "code", <Input id="code" {...register("code")} className="w-full ltr" />, errors.code)}
                {renderRow("Name", "name", <Input id="name" {...register("name")} className="w-full" />, errors.name)}
                
                {renderRow("Account Type", "type", (
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Debit">Debit</SelectItem>
                                    <SelectItem value="Credit">Credit</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.type)}

                {renderRow("Account Group", "group", (
                     <Controller
                        name="group"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Assets">Assets</SelectItem>
                                    <SelectItem value="Liabilities">Liabilities</SelectItem>
                                    <SelectItem value="Equity">Equity</SelectItem>
                                    <SelectItem value="Revenues">Revenues</SelectItem>
                                    <SelectItem value="Expenses">Expenses</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.group)}

                {renderRow("Closing Account Type", "closingType", (
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
                
                {renderRow("Account Classification", "classifications", (
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
                                      {selectedClassifications.length > 0 ? selectedClassifications.join(', ') : "Select classifications..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                <ScrollArea className='h-72'>
                                  {accountClassifications.map((item) => (
                                    <div key={item} className="flex items-center space-x-2 px-4 py-2">
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


                 {renderRow("Account Status", "status", (
                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ), errors.status)}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
