
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import type { User } from '@/app/(main)/users/page';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const sessionCookie = Cookies.get('session');
      if (sessionCookie) {
        const sessionUser = JSON.parse(sessionCookie);
        setUser(sessionUser);
      }
    } catch (error) {
      console.error('Failed to parse session cookie:', error);
      // If parsing fails, treat the user as not logged in.
      setUser(null); 
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
