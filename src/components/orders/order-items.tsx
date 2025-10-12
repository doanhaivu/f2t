import React from 'react';

import { Text, View, Image } from '@/components/ui';
import type { Order } from '@/api/orders';
import { formatPrice } from '@/api/products';

type OrderItemsProps = {
  order: Order;
};

export function OrderItems({ order }: OrderItemsProps) {
  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Items ({order.items.length})
      </Text>
      
      <View className="space-y-4">
        {order.items.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </View>

      {/* Order Notes */}
      {order.notes && (
        <View className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Text className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Order Notes
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {order.notes}
          </Text>
        </View>
      )}

      {/* Special Instructions */}
      {order.specialInstructions && (
        <View className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Text className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            Special Instructions
          </Text>
          <Text className="text-sm text-yellow-700 dark:text-yellow-300">
            {order.specialInstructions}
          </Text>
        </View>
      )}
    </View>
  );
}

type OrderItemProps = {
  item: Order['items'][0];
};

function OrderItem({ item }: OrderItemProps) {
  return (
    <View className="flex-row items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {/* Product Image */}
      <View className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
        {item.productImage ? (
          <Image
            source={{ uri: item.productImage }}
            className="w-full h-full"
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-gray-400 dark:text-gray-500 text-xs">No Image</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {item.productName}
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {item.unit}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-500">
          Farm: {item.farmName}
        </Text>
      </View>

      {/* Quantity and Price */}
      <View className="items-end">
        <Text className="text-sm font-medium text-gray-900 dark:text-white">
          {formatPrice(item.pricePerUnit)} × {item.quantity}
        </Text>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatPrice(item.totalPrice)}
        </Text>
      </View>
    </View>
  );
}
