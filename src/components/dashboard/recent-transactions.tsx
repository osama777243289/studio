import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const transactions = [
    { name: "أوليفيا مارتن", email: "olivia.martin@email.com", amount: "+$1,999.00", avatar: "/avatars/01.png" },
    { name: "جاكسون لي", email: "jackson.lee@email.com", amount: "+$39.00", avatar: "/avatars/02.png" },
    { name: "إيزابيلا نجوين", email: "isabella.nguyen@email.com", amount: "-$299.00", avatar: "/avatars/03.png" },
    { name: "ويليام كيم", email: "will@email.com", amount: "+$99.00", avatar: "/avatars/04.png" },
    { name: "صوفيا ديفيس", email: "sofia.davis@email.com", amount: "-$39.00", avatar: "/avatars/05.png" },
]

export function RecentTransactions() {
  return (
    <div className="space-y-8">
        {transactions.map((transaction, index) => (
             <div key={index} className="flex items-center">
                <div className={`ml-auto font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : ''}`}>{transaction.amount}</div>
                <div className="mr-4 space-y-1 text-right">
                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">
                    {transaction.email}
                </p>
                </div>
                <Avatar className="h-9 w-9">
                <AvatarImage data-ai-hint="person avatar" src={`https://picsum.photos/id/${10 + index}/40/40`} alt="Avatar" />
                <AvatarFallback>{transaction.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
            </div>
        ))}
    </div>
  )
}
