import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Text, View } from '@/components/ui';
import { useGetOrder } from '@/api/orders';
import { ConsumerRouteGuard } from '@/components/auth';

const CheckoutSuccessScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const {
    data: orderResponse,
    isLoading,
    error,
  } = useGetOrder({
    variables: { id: orderId! },
  });

  const order = orderResponse?.data;

  useEffect(() => {
    // Auto-redirect to order details after 3 seconds if order is loaded
    if (order && !isLoading) {
      const timer = setTimeout(() => {
        router.replace(`/orders/${order.id}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [order, isLoading, router]);

  const handleViewOrder = () => {
    if (order) {
      router.replace(`/orders/${order.id}`);
    }
  };

  const handleContinueShopping = () => {
    router.replace('/products');
  };

  const handleGoHome = () => {
    router.replace('/(app)');
  };

  if (isLoading) {
    return (
      <ConsumerRouteGuard>
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-4">
          <View className="items-center">
            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl">⏳</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Your Order
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              Please wait while we process your order...
            </Text>
          </View>
        </View>
      </ConsumerRouteGuard>
    );
  }

  if (error || !order) {
    return (
      <ConsumerRouteGuard>
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-4">
          <View className="items-center">
            <View className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl">❌</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Order Not Found
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We couldn't find your order. Please contact support if this issue persists.
            </Text>
            <View className="space-y-3 w-full max-w-sm">
              <Button
                label="Go Home"
                onPress={handleGoHome}
                variant="default"
                size="lg"
              />
              <Button
                label="Continue Shopping"
                onPress={handleContinueShopping}
                variant="ghost"
                size="lg"
              />
            </View>
          </View>
        </View>
      </ConsumerRouteGuard>
    );
  }

  return (
    <ConsumerRouteGuard>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Success Content */}
        <View className="flex-1 items-center justify-center px-4">
          <View className="items-center max-w-sm">
            {/* Success Icon */}
            <View className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center mb-6">
              <Text className="text-3xl">✅</Text>
            </View>

            {/* Success Message */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Order Placed Successfully!
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Thank you for your order. We've sent a confirmation email to your registered email address.
            </Text>

            {/* Order Details */}
            <View className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full mb-6">
              <View className="items-center">
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Order Number
                </Text>
                <Text className="text-lg font-mono font-semibold text-gray-900 dark:text-white mb-2">
                  #{order.orderNumber}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Amount
                </Text>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  ${order.total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Next Steps */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 w-full mb-6">
              <Text className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                What's Next?
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300">
                • You'll receive an email confirmation shortly{'\n'}
                • Your order will be prepared by the farm{'\n'}
                • You'll get updates on delivery status{'\n'}
                • Track your order in real-time
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 w-full">
              <Button
                label="View Order Details"
                onPress={handleViewOrder}
                variant="default"
                size="lg"
              />
              <Button
                label="Continue Shopping"
                onPress={handleContinueShopping}
                variant="outline"
                size="lg"
              />
              <Button
                label="Go Home"
                onPress={handleGoHome}
                variant="ghost"
                size="lg"
              />
            </View>

            {/* Auto-redirect notice */}
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Redirecting to order details in 3 seconds...
            </Text>
          </View>
        </View>
      </View>
    </ConsumerRouteGuard>
  );
};

export default CheckoutSuccessScreen;
