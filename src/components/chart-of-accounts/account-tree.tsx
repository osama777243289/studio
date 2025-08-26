"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, Plus, Trash2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Account {
  id: string;
  code: string;
  name: string;
  children?: Account[];
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
    <div className="space-y-1">
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
  const [isOpen, setIsOpen] = React.useState(level < 1);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group", `pl-${level * 4 + 2}`)}>
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
        <span className="flex-1 font-medium">{account.name}</span>
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
