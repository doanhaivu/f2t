import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react-native';

import { useGetOrders } from '@/api/orders';
import type { OrderStatus, OrderSortBy } from '@/api/orders/types';
import { OrderListItem } from '@/components/orders/order-list-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui';

type OrderFilters = {
  search: string;
  status?: OrderStatus;
  sortBy: OrderSortBy;
  sortOrder: 'asc' | 'desc';
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch orders with filters
  const { data, isLoading, isError, error, refetch } = useGetOrders({
    variables: {
      page: 1,
      limit: 20,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      status: filters.status,
      search: filters.search || undefined,
    },
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  // Handle order press
  const handleOrderPress = useCallback((orderId: string) => {
    router.push(`/orders/${orderId}`);
  }, [router]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
  }, []);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Render order item
  const renderOrderItem = useCallback(({ item }: { item: any }) => (
    <OrderListItem
      order={item}
      onPress={() => handleOrderPress(item.id)}
    />
  ), [handleOrderPress]);

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" className="text-blue-600" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">
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
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            {error?.message || 'Something went wrong'}
          </Text>
          <Button
            label="Try Again"
            onPress={() => refetch()}
            variant="outline"
          />
        </View>
      );
    }

    if (filters.search && orders.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-12 px-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No orders found
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Try adjusting your search or filters
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text className="text-6xl mb-4">📦</Text>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No orders yet
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Your order history will appear here
        </Text>
        <Button
          label="Start Shopping"
          onPress={() => router.push('/(app)')}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-12 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Order History
        </Text>

        {/* Search and filters */}
        <View className="flex-row items-center space-x-2 mb-3">
          <View className="flex-1">
            <Input
              value={filters.search}
              onChangeText={handleSearch}
              placeholder="Search orders..."
              className="pr-10"
            />
          </View>
          <TouchableOpacity
            onPress={toggleSortOrder}
            className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            {filters.sortOrder === 'desc' ? (
              <SortDesc size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <SortAsc size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {pagination && (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} {pagination.total === 1 ? 'order' : 'orders'} total
          </Text>
        )}
      </View>

      {/* Order list */}
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

