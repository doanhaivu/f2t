import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { View, Text, Button } from '@/components/ui';
import { useAuth } from '@/lib';
import type { UserRole } from '@/types';

export type RouteGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  requireFarmData?: boolean;
  fallbackRoute?: string;
  showFallbackUI?: boolean;
  fallbackComponent?: React.ComponentType;
};

export const RouteGuard = ({
  children,
  allowedRoles,
  requiredPermissions = [],
  requireFarmData = false,
  fallbackRoute = '/login',
  showFallbackUI = true,
  fallbackComponent: FallbackComponent,
}: RouteGuardProps) => {
  const router = useRouter();
  const user = useAuth.use.user();
  const farm = useAuth.use.farm();
  const isAuthenticated = useAuth.use.status() === 'signIn';
  const hasPermission = useAuth.use.hasPermission();
  const hasFarmData = useAuth.use.hasFarmData();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace(fallbackRoute as any);
      return;
    }
  }, [isAuthenticated, router, fallbackRoute]);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    if (!showFallbackUI) {
      return null;
    }

    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="items-center mb-6">
          <Text className="text-2xl mb-2">🚫</Text>
          <Text className="text-xl font-semibold text-center mb-4">
            Access Denied
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
            You don't have permission to access this feature. This area is restricted to {allowedRoles.join(' and ')} users.
          </Text>
        </View>
        
        <Button
          label="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  // Check specific permissions
  for (const permission of requiredPermissions) {
    if (!hasPermission(permission)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      if (!showFallbackUI) {
        return null;
      }

      return (
        <View className="flex-1 justify-center items-center p-6">
          <View className="items-center mb-6">
            <Text className="text-2xl mb-2">🔒</Text>
            <Text className="text-xl font-semibold text-center mb-4">
              Insufficient Permissions
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
              You don't have the required permissions to access this feature.
            </Text>
          </View>
          
          <Button
            label="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      );
    }
  }

  // Check farm data requirement
  if (requireFarmData && !hasFarmData()) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    if (!showFallbackUI) {
      return null;
    }

    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="items-center mb-6">
          <Text className="text-2xl mb-2">🚜</Text>
          <Text className="text-xl font-semibold text-center mb-4">
            Farm Setup Required
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
            You need to set up your farm profile to access this feature.
          </Text>
        </View>
        
        <View className="flex-row space-x-4">
          <Button
            label="Set Up Farm"
            onPress={() => router.push('/farms/register' as any)}
            className="flex-1"
          />
          <Button
            label="Go Back"
            onPress={() => router.back()}
            variant="outline"
            className="flex-1"
          />
        </View>
      </View>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};
