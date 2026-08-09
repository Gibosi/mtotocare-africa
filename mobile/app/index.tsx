import React from 'react';
import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';

export default function Index() {
  const user = useAppSelector(s => s.auth.user);
  const initialized = useAppSelector(s => s.auth.initialized);

  // While the auth state is being loaded, show nothing (splash screen stays visible).
  // The root layout also has a 5s safety timeout that flips `timedOut=true`,
  // at which point the splash is hidden and this screen renders.
  if (!initialized) {
    return null;
  }

  // Not logged in → go to welcome
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  // Logged in → route by role
  const roles = user.roles || [];
  if (roles.includes('ADMIN')) {
    return <Redirect href="/(admin)/dashboard" />;
  }
  if (roles.some(r => ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER'].includes(r))) {
    return <Redirect href="/(provider)/dashboard" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
