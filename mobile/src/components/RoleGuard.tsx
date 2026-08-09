import React from 'react';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allow: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allow, fallback = null }) => {
  const user = useAppSelector(s => s.auth.user);
  if (!user) return <>{fallback}</>;

  const userRoles = user.roles || [];
  const hasAllowedRole = allow.some(role => userRoles.includes(role));

  return <>{hasAllowedRole ? children : fallback}</>;
};

export const isParent = (roles: string[] = []) => roles.includes('PARENT') && !roles.includes('ADMIN') && !roles.includes('DOCTOR') && !roles.includes('NURSE');
export const isProvider = (roles: string[] = []) =>
  roles.some(r => ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER'].includes(r));
export const isAdmin = (roles: string[] = []) => roles.includes('ADMIN');

export const getPrimaryRole = (roles: string[] = []): 'ADMIN' | 'PROVIDER' | 'PARENT' => {
  if (isAdmin(roles)) return 'ADMIN';
  if (isProvider(roles)) return 'PROVIDER';
  return 'PARENT';
};
