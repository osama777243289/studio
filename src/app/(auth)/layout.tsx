
import { Landmark } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl text-primary">المحاسب</span>
            </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
             {children}
        </main>
    </div>
  )
}
