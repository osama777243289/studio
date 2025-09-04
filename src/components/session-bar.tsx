
'use client';

import { useAuth } from '@/contexts/auth-context';
import { UserCircle } from 'lucide-react';

export function SessionBar() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null; // Don't render anything if loading or no user
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="container mx-auto px-4 h-10 flex items-center justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCircle className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{user.name}</span>
        </div>
      </div>
    </div>
  );
}
