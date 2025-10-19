import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Package } from 'lucide-react-native';

import { OrderStatusBadge } from './order-status-badge';
import type { Order } from '@/api/orders/types';

type OrderListItemProps = {
  order: Order;
  onPress?: (order: Order) => void;
  showCustomerInfo?: boolean;
  className?: string;
};

// Format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// Format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function OrderListItem({
  order,
  onPress,
  showCustomerInfo = false,
  className = '',
}: OrderListItemProps) {
  const handlePress = () => {
    onPress?.(order);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mr-3">
            <Package size={20} className="text-blue-600 dark:text-blue-400" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {order.orderNumber}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
            </Text>
          </View>
        </View>
        {onPress && (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </View>

      {/* Customer info (for farm view) */}
      {showCustomerInfo && (
        <View className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Customer: <Text className="font-medium text-gray-900 dark:text-white">{order.customerName}</Text>
          </Text>
          {order.customerEmail && (
            <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {order.customerEmail}
            </Text>
          )}
        </View>
      )}

      {/* Order details */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
          </Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(order.total, order.currency)}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} size="md" />
      </View>

      {/* Payment and delivery info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {order.paymentMethod.replace(/_/g, ' ')}
            </Text>
          </View>
          <View className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {order.deliveryMethod.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        {order.paymentStatus !== 'completed' && (
          <View className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded">
            <Text className="text-xs font-medium text-yellow-700 dark:text-yellow-300 capitalize">
              {order.paymentStatus}
            </Text>
          </View>
        )}
      </View>

      {/* Delivery date if available */}
      {order.estimatedDeliveryTime && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Estimated delivery: <Text className="font-medium">{formatDate(order.estimatedDeliveryTime)}</Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

