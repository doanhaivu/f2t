import React from 'react';
import { Alert } from 'react-native';

import { Button, Text, View, ScrollView } from '@/components/ui';
import type { Order } from '@/api/orders';
import { OrderHeader } from './order-header';
import { OrderStatusTimeline } from './order-status-timeline';
import { OrderItems } from './order-items';
import { OrderSummary } from './order-summary';
import { OrderActions } from './order-actions';
import { OrderDeliveryInfo } from './order-delivery-info';
import { OrderPaymentInfo } from './order-payment-info';

type OrderConfirmationProps = {
  order?: Order;
  isLoading?: boolean;
  error?: string;
  onBack: () => void;
  onViewProducts: () => void;
  onContactSupport: () => void;
  onTrackOrder?: () => void;
  onCancelOrder?: () => void;
  onReorder?: () => void;
};

export function OrderConfirmation({
  order,
  isLoading = false,
  error,
  onBack,
  onViewProducts,
  onContactSupport,
  onTrackOrder,
  onCancelOrder,
  onReorder,
}: OrderConfirmationProps) {
  if (isLoading) {
    return <OrderConfirmationSkeleton onBack={onBack} />;
  }

  if (error || !order) {
    return <OrderConfirmationError error={error} onBack={onBack} onContactSupport={onContactSupport} />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <OrderHeader order={order} onBack={onBack} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Status Timeline */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <OrderStatusTimeline order={order} />
        </View>

        {/* Order Items */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <OrderItems order={order} />
        </View>

        {/* Delivery Information */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <OrderDeliveryInfo order={order} />
        </View>

        {/* Payment Information */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <OrderPaymentInfo order={order} />
        </View>

        {/* Order Summary */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <OrderSummary order={order} />
        </View>

        {/* Order Actions */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 mb-6 rounded-lg p-4">
          <OrderActions
            order={order}
            onTrackOrder={onTrackOrder}
            onCancelOrder={onCancelOrder}
            onReorder={onReorder}
            onContactSupport={onContactSupport}
            onViewProducts={onViewProducts}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Loading skeleton component
function OrderConfirmationSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Button label="← Back" onPress={onBack} variant="ghost" size="sm" />
          <View className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <View className="w-12" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Timeline Skeleton */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <View className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <View className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="flex-row items-center space-x-3">
                <View className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <View className="flex-1">
                  <View className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <View className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Items Skeleton */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <View className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <View className="space-y-3">
            {[1, 2].map((i) => (
              <View key={i} className="flex-row items-center space-x-3">
                <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <View className="flex-1">
                  <View className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <View className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </View>
                <View className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </View>
            ))}
          </View>
        </View>

        {/* Summary Skeleton */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg p-4">
          <View className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <View className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="flex-row justify-between">
                <View className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <View className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Error state component
function OrderConfirmationError({
  error,
  onBack,
  onContactSupport,
}: {
  error?: string;
  onBack: () => void;
  onContactSupport: () => void;
}) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Button label="← Back" onPress={onBack} variant="ghost" size="sm" />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Details
          </Text>
          <View className="w-12" />
        </View>
      </View>

      {/* Error Content */}
      <View className="flex-1 items-center justify-center px-4">
        <View className="items-center">
          <View className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">❌</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Order
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error || 'We couldn\'t find this order. It may have been deleted or you may not have permission to view it.'}
          </Text>
          <View className="space-y-3 w-full max-w-sm">
            <Button
              label="Contact Support"
              onPress={onContactSupport}
              variant="default"
              size="lg"
            />
            <Button
              label="Go Back"
              onPress={onBack}
              variant="ghost"
              size="lg"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
