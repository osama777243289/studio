'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

export interface NavLink {
  title: string;
  href: string;
  icon: IconName;
}

interface NavProps {
  links: NavLink[];
}

export function Nav({ links }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
      {links.map((link) => {
        const Icon = LucideIcons[link.icon] as LucideIcons.LucideIcon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
              isActive && 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{link.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
