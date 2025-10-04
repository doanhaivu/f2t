import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Text, View } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useGetFarm } from '@/api/farms';

import { DashboardHeader } from './dashboard-header';
import { QuickStats } from './quick-stats';
import { RecentOrders } from './recent-orders';
import { ProductManagement } from './product-management';
import { QuickActions } from './quick-actions';

// Hook for dashboard data and handlers
const useDashboardData = () => {
  const router = useRouter();
  const { farm: getCurrentFarm } = useAuth.use;
  const currentFarm = getCurrentFarm();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: farmResponse,
    isLoading,
    error,
    refetch,
  } = useGetFarm({
    variables: { id: currentFarm?.id || '' },
  });

  const farm = farmResponse?.success ? farmResponse.data : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewProfile = () => {
    if (farm?.id) {
      router.push(`/farms/${farm.id}`);
    }
  };

  const handleEditProfile = () => {
    if (farm?.id) {
      router.push(`/farms/${farm.id}/edit`);
    }
  };

  const handleManageProducts = () => {
    router.push('/dashboard/products');
  };

  const handleViewOrders = () => {
    router.push('/dashboard/orders');
  };

  const handleViewAnalytics = () => {
    router.push('/dashboard/analytics');
  };

  return {
    farm,
    isLoading,
    error,
    refreshing,
    refetch,
    handleRefresh,
    handleViewProfile,
    handleEditProfile,
    handleManageProducts,
    handleViewOrders,
    handleViewAnalytics,
  };
};

// Loading state component
const DashboardLoadingState = () => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <DashboardHeader farm={null} />
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-600 dark:text-gray-400">
        Loading dashboard...
      </Text>
    </View>
  </View>
);

// Error state component
const DashboardErrorState = ({ 
  error, 
  onRetry 
}: { 
  error: any; 
  onRetry: () => void; 
}) => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <DashboardHeader farm={null} />
    <View className="flex-1 items-center justify-center p-6">
      <Text className="mb-4 text-center text-xl font-semibold text-gray-900 dark:text-white">
        Unable to Load Dashboard
      </Text>
      <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
        {error ? 'Please check your connection and try again.' : 'Farm data not found.'}
      </Text>
      <Button
        label="Try Again"
        onPress={onRetry}
        variant="outline"
      />
    </View>
  </View>
);

// Main dashboard content
const DashboardContent = ({
  farm,
  refreshing,
  handleRefresh,
  handleViewProfile,
  handleEditProfile,
  handleManageProducts,
  handleViewOrders,
  handleViewAnalytics,
}: {
  farm: any;
  refreshing: boolean;
  handleRefresh: () => void;
  handleViewProfile: () => void;
  handleEditProfile: () => void;
  handleManageProducts: () => void;
  handleViewOrders: () => void;
  handleViewAnalytics: () => void;
}) => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <DashboardHeader farm={farm} />
    
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <QuickActions
        onViewProfile={handleViewProfile}
        onEditProfile={handleEditProfile}
        onManageProducts={handleManageProducts}
        onViewOrders={handleViewOrders}
        onViewAnalytics={handleViewAnalytics}
      />
      <QuickStats farmId={farm.id} />
      <RecentOrders farmId={farm.id} />
      <ProductManagement farmId={farm.id} />
      <View className="h-6" />
    </ScrollView>
  </View>
);

export const FarmDashboard = () => {
  const {
    farm,
    isLoading,
    error,
    refreshing,
    refetch,
    handleRefresh,
    handleViewProfile,
    handleEditProfile,
    handleManageProducts,
    handleViewOrders,
    handleViewAnalytics,
  } = useDashboardData();

  if (isLoading) return <DashboardLoadingState />;
  if (error || !farm) return <DashboardErrorState error={error} onRetry={() => refetch()} />;

  return (
    <DashboardContent
      farm={farm}
      refreshing={refreshing}
      handleRefresh={handleRefresh}
      handleViewProfile={handleViewProfile}
      handleEditProfile={handleEditProfile}
      handleManageProducts={handleManageProducts}
      handleViewOrders={handleViewOrders}
      handleViewAnalytics={handleViewAnalytics}
    />
  );
};
