import React from 'react';
import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

export default function IndexScreen() {
  const isFarm = useAuth.use.isFarm;
  const isUserFarm = isFarm(); // Call the function

  // Redirect based on user role
  if (isUserFarm()) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/(app)/home" />;
}
