
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Landmark,
} from 'lucide-react';
import { Nav, type NavLink } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const navLinks: NavLink[] = [
  { title: 'لوحة التحكم', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'الدخل', href: '/income', icon: 'ArrowUpCircle' },
  { title: 'المصروفات', href: '/expenses', icon: 'ArrowDownCircle' },
  { title: 'المبيعات اليومية', href: '/sales', icon: 'ShoppingCart' },
  { title: 'مطابقة المبيعات', href: '/sales-matching', icon: 'CheckSquare' },
  { title: 'ترحيل القيود', href: '/post-entries', icon: 'Send' },
  { title: 'دليل الحسابات', href: '/chart-of-accounts', icon: 'Network' },
  { title: 'اليومية العامة', href: '/general-journal', icon: 'Book' },
  { title: 'التدفق النقدي', href: '/cash-flow', icon: 'TrendingUp' },
  { title: 'التقارير', href: '/reports', icon: 'FileText' },
  { title: 'المستخدمون', href: '/users', icon: 'Users' },
  { title: 'إدارة الأدوار', href: '/roles', icon: 'ShieldCheck' },
  { title: 'إعدادات البيانات', href: '/data-settings', icon: 'Database' },
];

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User Avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">المستخدم الحالي</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com
            </p>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-l bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-4">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl text-primary">المحاسب</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Nav links={navLinks} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">تبديل قائمة التنقل</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
               <SheetTitle className="sr-only">قائمة التنقل الرئيسية</SheetTitle>
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                 <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Landmark className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl text-primary">المحاسب</span>
                </Link>
              </div>
              <Nav links={navLinks} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
           <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
