import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Text, View } from '@/components/ui';
import { CartItem, CartSummary } from '@/components/cart';
import { useCart, useCartIsEmpty } from '@/lib/cart';

export default function CartScreen() {
  const router = useRouter();
  const cart = useCart();
  const isEmpty = useCartIsEmpty();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleViewProducts = () => {
    router.push('/products');
  };

  const handleViewFarms = () => {
    router.push('/farms');
  };

  if (isEmpty) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6 dark:bg-gray-900">
        <Text className="mb-2 text-6xl">🛒</Text>
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Your Cart is Empty
        </Text>
        <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
          Start adding fresh products from local farms to your cart
        </Text>
        <Button
          label="Browse Products"
          onPress={handleViewProducts}
          className="mb-3 w-full"
        />
        <Button
          label="Discover Farms"
          onPress={handleViewFarms}
          variant="outline"
          className="w-full"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Cart Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Cart Items */}
          <View className="mb-4 space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                variant="default"
                onQuantityChange={(quantity) => cart.updateQuantity(item.id, quantity)}
                onRemove={() => cart.removeItem(item.id)}
              />
            ))}
          </View>

          {/* Continue Shopping Button */}
          <Button
            label="Continue Shopping"
            onPress={handleViewProducts}
            variant="outline"
            className="mb-4"
          />
        </View>
      </ScrollView>

      {/* Cart Summary - Fixed at bottom */}
      <View className="border-t border-gray-200 dark:border-gray-700">
        <CartSummary
          variant="detailed"
          onCheckout={handleCheckout}
          onViewProducts={handleViewProducts}
        />
      </View>
    </View>
  );
}

