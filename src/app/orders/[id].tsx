import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MapPin, Package, Truck, Calendar, CreditCard } from 'lucide-react-native';

import { useGetOrder, useCancelOrder } from '@/api/orders';
import { OrderStatusBadge, OrderStatusTimeline } from '@/components/orders';
import { Button, FocusAwareStatusBar } from '@/components/ui';

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
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showTimeline, setShowTimeline] = useState(true);

  // Fetch order details
  const { data, isLoading, isError, error, refetch } = useGetOrder({
    variables: { id: id || '' },
  });

  // Cancel order mutation
  const cancelOrderMutation = useCancelOrder();

  const order = data?.data;

  // Handle cancel order
  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrderMutation.mutateAsync({
                id: id || '',
                reason: 'Customer requested cancellation',
              });
              Alert.alert('Success', 'Order cancelled successfully');
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  // Handle contact actions
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <FocusAwareStatusBar />
        <ActivityIndicator size="large" className="text-blue-600" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Loading order details...
        </Text>
      </View>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <FocusAwareStatusBar />
        
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-12 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <ArrowLeft size={24} className="text-gray-900 dark:text-white mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load order
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            {error?.message || 'Order not found'}
          </Text>
          <Button
            label="Try Again"
            onPress={() => refetch()}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-12 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <ArrowLeft size={24} className="text-gray-900 dark:text-white mr-2" />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Details
          </Text>
        </TouchableOpacity>

        {/* Order number and status */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {order.orderNumber}
          </Text>
          <OrderStatusBadge status={order.status} size="lg" />
        </View>

        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Placed on {formatDate(order.createdAt)}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <View className="bg-white dark:bg-gray-800 mb-3 p-4">
            <TouchableOpacity
              onPress={() => setShowTimeline(!showTimeline)}
              className="flex-row items-center justify-between mb-3"
            >
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Timeline
              </Text>
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                {showTimeline ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>

            {showTimeline && (
              <OrderStatusTimeline
                events={order.timeline}
                currentStatus={order.status}
                compact={true}
              />
            )}
          </View>
        )}

        {/* Order Items */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <View className="flex-row items-center mb-3">
            <Package size={20} className="text-gray-700 dark:text-gray-300 mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Items ({order.totalItems})
            </Text>
          </View>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row justify-between py-3 ${
                index < order.items.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  {item.productName}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {item.quantity} × {formatCurrency(item.pricePerUnit, order.currency)}
                </Text>
                {item.notes && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: {item.notes}
                  </Text>
                )}
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.totalPrice, order.currency)}
              </Text>
            </View>
          ))}

          {/* Order summary */}
          <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Subtotal</Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                {formatCurrency(order.subtotal, order.currency)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                {formatCurrency(order.deliveryFee, order.currency)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Tax</Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                {formatCurrency(order.tax, order.currency)}
              </Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">Total</Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(order.total, order.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <View className="flex-row items-center mb-3">
            <Truck size={20} className="text-gray-700 dark:text-gray-300 mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Delivery Information
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Method
            </Text>
            <Text className="text-base text-gray-900 dark:text-white capitalize">
              {order.deliveryMethod.replace(/_/g, ' ')}
            </Text>
          </View>

          {order.estimatedDeliveryTime && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Delivery
              </Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {formatDate(order.estimatedDeliveryTime)}
              </Text>
            </View>
          )}

          {order.actualDeliveryTime && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivered On
              </Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {formatDate(order.actualDeliveryTime)}
              </Text>
            </View>
          )}

          {order.trackingNumber && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tracking Number
              </Text>
              <Text className="text-base font-mono text-blue-600 dark:text-blue-400">
                {order.trackingNumber}
              </Text>
            </View>
          )}

          {order.deliveryInstructions && (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Instructions
              </Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {order.deliveryInstructions}
              </Text>
            </View>
          )}
        </View>

        {/* Shipping Address */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <View className="flex-row items-center mb-3">
            <MapPin size={20} className="text-gray-700 dark:text-gray-300 mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Shipping Address
            </Text>
          </View>

          <Text className="text-base text-gray-900 dark:text-white mb-1">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {order.shippingAddress.addressLine1}
          </Text>
          {order.shippingAddress.addressLine2 && (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {order.shippingAddress.addressLine2}
            </Text>
          )}
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {order.shippingAddress.country}
          </Text>

          {order.shippingAddress.phoneNumber && (
            <TouchableOpacity
              onPress={() => handleCall(order.shippingAddress.phoneNumber)}
              className="flex-row items-center"
            >
              <Phone size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                {order.shippingAddress.phoneNumber}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Information */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <View className="flex-row items-center mb-3">
            <CreditCard size={20} className="text-gray-700 dark:text-gray-300 mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Information
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </Text>
            <Text className="text-base text-gray-900 dark:text-white capitalize">
              {order.paymentMethod.replace(/_/g, ' ')}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Status
            </Text>
            <View className="flex-row items-center">
              <View
                className={`px-3 py-1 rounded-full ${
                  order.paymentStatus === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : order.paymentStatus === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    order.paymentStatus === 'completed'
                      ? 'text-green-700 dark:text-green-300'
                      : order.paymentStatus === 'pending'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {order.paymentStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Support */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Need Help?
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Contact us if you have any questions about your order
          </Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleEmail('support@farmmarket.com')}
              className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-lg"
            >
              <Mail size={20} className="text-white mr-2" />
              <Text className="text-white font-medium">Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cancel Order Button */}
        {canCancel && (
          <View className="px-4 pb-6">
            <Button
              label="Cancel Order"
              onPress={handleCancelOrder}
              variant="outline"
              loading={cancelOrderMutation.isPending}
              className="border-red-600 dark:border-red-400"
            />
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
