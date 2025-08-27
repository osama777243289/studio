import { Transaction } from "@/lib/firebase/firestore/transactions"
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>لا توجد معاملات مسجلة حتى الآن.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
        {transactions.map((transaction) => (
             <div key={transaction.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.accountName}</p>
                <p className="text-sm text-muted-foreground">
                    {/* Check if date is a Firebase Timestamp */}
                    {transaction.date && typeof transaction.date.toDate === 'function' 
                        ? formatDistanceToNow(transaction.date.toDate(), { addSuffix: true, locale: ar })
                        : 'تاريخ غير صالح'}
                </p>
                </div>
                <div className={`mr-auto font-medium text-lg ${transaction.type === 'Income' ? 'text-green-600' : 'text-destructive'}`}>
                    {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </div>
            </div>
        ))}
    </div>
  )
}
