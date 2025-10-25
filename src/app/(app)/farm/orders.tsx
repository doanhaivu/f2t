import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react-native';

import { useGetOrders, useOrderStats } from '@/api/orders';
import type { OrderStatus } from '@/api/orders/types';
import { OrderListItem } from '@/components/orders/order-list-item';
import { FocusAwareStatusBar } from '@/components/ui';
import { RouteGuard } from '@/components/auth/route-guard';

type OrderTab = 'all' | OrderStatus;

const ORDER_TABS: Array<{ key: OrderTab; label: string; icon?: React.ComponentType<any> }> = [
  { key: 'all', label: 'All Orders', icon: Package },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: TrendingUp },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

function FarmOrdersContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders based on active tab
  const { data, isLoading, isError, error, refetch } = useGetOrders({
    variables: {
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: activeTab !== 'all' ? (activeTab as OrderStatus) : undefined,
    },
  });

  // Fetch order statistics
  const { data: statsData } = useOrderStats({
    variables: {},
  });

  const orders = data?.data?.orders || [];
  const stats = statsData?.data;

  // Handle order press
  const handleOrderPress = useCallback((orderId: string) => {
    router.push(`/orders/${orderId}`);
  }, [router]);

  // Get count for each tab
  const getTabCount = useCallback((tab: OrderTab) => {
    if (!stats) return 0;
    if (tab === 'all') return stats.totalOrders;
    return stats.ordersByStatus?.[tab as OrderStatus] || 0;
  }, [stats]);

  // Render order item
  const renderOrderItem = useCallback(({ item }: { item: any }) => (
    <OrderListItem
      order={item}
      onPress={() => handleOrderPress(item.id)}
      showCustomerInfo={true}
    />
  ), [handleOrderPress]);

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-500 dark:text-gray-400">
            Loading orders...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-12 px-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load orders
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {error?.message || 'Something went wrong'}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text className="text-6xl mb-4">📦</Text>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No orders found
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {activeTab === 'all' 
            ? 'You haven\'t received any orders yet'
            : `No ${activeTab} orders at the moment`
          }
        </Text>
      </View>
    );
  };

  // Calculate statistics
  const todayRevenue = useMemo(() => {
    if (!stats) return 0;
    return stats.totalRevenue || 0;
  }, [stats]);

  const pendingOrdersCount = useMemo(() => {
    if (!stats) return 0;
    return (stats.ordersByStatus?.pending || 0) + (stats.ordersByStatus?.confirmed || 0);
  }, [stats]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-12 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Farm Orders
        </Text>

        {/* Statistics Cards */}
        {stats && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row space-x-3">
              {/* Total Orders */}
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 min-w-[140px]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-blue-600 dark:text-blue-400">
                    Total Orders
                  </Text>
                  <Package size={20} className="text-blue-600 dark:text-blue-400" />
                </View>
                <Text className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalOrders}
                </Text>
              </View>

              {/* Pending Orders */}
              <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 min-w-[140px]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-yellow-600 dark:text-yellow-400">
                    Pending
                  </Text>
                  <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                </View>
                <Text className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {pendingOrdersCount}
                </Text>
              </View>

              {/* Today's Revenue */}
              <View className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 min-w-[140px]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-green-600 dark:text-green-400">
                    Today's Revenue
                  </Text>
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                </View>
                <Text className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${todayRevenue.toFixed(0)}
                </Text>
              </View>

              {/* Completed */}
              <View className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 min-w-[140px]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-purple-600 dark:text-purple-400">
                    Completed
                  </Text>
                  <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                </View>
                <Text className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.ordersByStatus?.delivered || 0}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Status Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {ORDER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getTabCount(tab.key);
            
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {count > 0 && (
                    <View
                      className={`ml-2 px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default function FarmOrdersScreen() {
  return (
    <RouteGuard requireFarmData={true} allowedRoles={['farm']}>
      <FarmOrdersContent />
    </RouteGuard>
  );
}

