
"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, Plus, Trash2, Pencil, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

export const accountClassifications = [
    'Cashbox', 'Bank', 'Networks', 'Employee', 'Custody', 'Fixed Assets', 
    'Clients', 'Cashiers', 'Suppliers', 'Expenses', 'Revenues'
];
export const closingAccountTypes = ['Balance Sheet', 'Income Statement'];

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Debit' | 'Credit';
  group: 'Assets' | 'Liabilities' | 'Equity' | 'Revenues' | 'Expenses';
  status: 'Active' | 'Inactive';
  closingType: typeof closingAccountTypes[number];
  classifications: (typeof accountClassifications[number])[];
  children?: Account[];
  parentId?: string | null;
}

interface AccountTreeProps {
  accounts: Account[];
  level?: number;
  onAddSubAccount: (parentId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

interface AccountItemProps {
  account: Account;
  level: number;
  onAddSubAccount: (parentId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export function AccountTree({ accounts, level = 0, onAddSubAccount, onEditAccount, onDeleteAccount }: AccountTreeProps) {
  return (
    <div className="space-y-1 w-full min-w-[800px] md:min-w-full">
      {accounts.map((account) => (
        <AccountItem 
          key={account.id} 
          account={account} 
          level={level} 
          onAddSubAccount={onAddSubAccount}
          onEditAccount={onEditAccount}
          onDeleteAccount={onDeleteAccount}
        />
      ))}
    </div>
  )
}

function AccountItem({ account, level, onAddSubAccount, onEditAccount, onDeleteAccount }: AccountItemProps) {
  const [isOpen, setIsOpen] = React.useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const isTransactional = !hasChildren;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn("flex flex-col gap-2 p-2 rounded-md hover:bg-muted/50 group", `pl-${level * 4}`)}>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className='w-6'>
                {hasChildren && (
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                )}
                </div>
                <span className="font-mono text-sm text-muted-foreground w-24">{account.code}</span>
                <span className="flex-1 font-medium flex items-center gap-2">
                  {account.name}
                  {isTransactional && <FileText className="h-4 w-4 text-blue-500" title="Transactional Account" />}
                </span>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{account.group}</Badge>
                    <Badge variant={account.status === 'Active' ? 'default' : 'destructive'} className={account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{account.status}</Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditAccount(account)}>
                        <Pencil className="h-4 w-4 text-blue-500"/>
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddSubAccount(account.id)}>
                        <Plus className="h-4 w-4 text-green-500"/>
                        <span className="sr-only">Add Sub-account</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteAccount(account)}>
                        <Trash2 className="h-4 w-4 text-red-500"/>
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </div>
            {account.classifications && account.classifications.length > 0 && (
                 <div className={cn("flex items-center gap-2 flex-wrap", `pl-8`)}>
                     {account.classifications.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                 </div>
            )}
        </div>
      {hasChildren && (
        <CollapsibleContent>
            <AccountTree 
              accounts={account.children!} 
              level={level + 1} 
              onAddSubAccount={onAddSubAccount}
              onEditAccount={onEditAccount}
              onDeleteAccount={onDeleteAccount}
            />
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
