import React from 'react';

import { Text, View } from '@/components/ui';
import type { Order } from '@/api/orders';
import { getEstimatedDeliveryTime } from '@/api/orders';

type OrderDeliveryInfoProps = {
  order: Order;
};

export function OrderDeliveryInfo({ order }: OrderDeliveryInfoProps) {
  const estimatedDelivery = getEstimatedDeliveryTime(order);

  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Delivery Information
      </Text>
      
      <View className="space-y-4">
        {/* Delivery Method */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Delivery Method
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {getDeliveryMethodText(order.deliveryMethod)}
          </Text>
        </View>

        {/* Delivery Address */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Delivery Address
          </Text>
          <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.shippingAddress.addressLine1}
            </Text>
            {order.shippingAddress.addressLine2 && (
              <Text className="text-sm text-gray-900 dark:text-white">
                {order.shippingAddress.addressLine2}
              </Text>
            )}
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.shippingAddress.country}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Phone: {order.shippingAddress.phoneNumber}
            </Text>
          </View>
        </View>

        {/* Delivery Date and Time */}
        {order.deliveryDate && (
          <View>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Delivery Date & Time
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {order.deliveryTimeSlot && (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {' '}• {order.deliveryTimeSlot}
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <View>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Estimated Delivery
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {estimatedDelivery}
            </Text>
          </View>
        )}

        {/* Delivery Instructions */}
        {order.deliveryInstructions && (
          <View>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Delivery Instructions
            </Text>
            <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                {order.deliveryInstructions}
              </Text>
            </View>
          </View>
        )}

        {/* Delivery Status */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Delivery Status
          </Text>
          <View className="flex-row items-center space-x-2">
            <View className={`w-2 h-2 rounded-full ${
              order.status === 'delivered' 
                ? 'bg-green-500' 
                : order.status === 'out_for_delivery' 
                ? 'bg-blue-500' 
                : 'bg-gray-400'
            }`} />
            <Text className="text-sm text-gray-900 dark:text-white">
              {getDeliveryStatusText(order.status)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function getDeliveryMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    pickup: 'Pickup at Farm',
    delivery: 'Home Delivery',
    farm_delivery: 'Farm Delivery',
    third_party: 'Third Party Delivery',
  };
  
  return methodMap[method] || method;
}

function getDeliveryStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Preparing for delivery',
    confirmed: 'Confirmed for delivery',
    preparing: 'Being prepared',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered successfully',
    cancelled: 'Delivery cancelled',
    refunded: 'Delivery refunded',
  };
  
  return statusMap[status] || 'Unknown status';
}
