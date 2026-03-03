import React from 'react';
import { useAuth } from './AuthProvider';

export default function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }){
  const { user } = useAuth();
  if (!user) return null;
  if (roles.includes(user.role)) return <>{children}</>;
  return null;
}
