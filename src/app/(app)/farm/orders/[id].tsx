import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MapPin, Package, Truck, Edit, CheckCircle } from 'lucide-react-native';

import { useGetOrder, useUpdateOrderStatus } from '@/api/orders';
import { OrderStatusBadge, OrderStatusTimeline, OrderStatusUpdateModal } from '@/components/orders';
import { Button, FocusAwareStatusBar } from '@/components/ui';
import { RouteGuard } from '@/components/auth/route-guard';
import type { OrderStatus } from '@/api/orders/types';

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

function FarmOrderDetailContent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showTimeline, setShowTimeline] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch order details
  const { data, isLoading, isError, error, refetch } = useGetOrder({
    variables: { id: id || '' },
  });

  // Update order status mutation
  const updateStatusMutation = useUpdateOrderStatus();

  const order = data?.data;

  // Handle status update
  const handleUpdateStatus = async (newStatus: OrderStatus, notes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: id || '',
        status: newStatus,
        notes,
      });
      await refetch();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update order status');
    }
  };

  // Handle contact actions
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Quick action buttons
  const getQuickActions = () => {
    if (!order) return [];

    const actions = [];

    if (order.status === 'pending') {
      actions.push({
        label: 'Confirm Order',
        status: 'confirmed' as OrderStatus,
        icon: CheckCircle,
        color: 'bg-blue-600',
      });
    }

    if (order.status === 'confirmed') {
      actions.push({
        label: 'Start Preparing',
        status: 'preparing' as OrderStatus,
        icon: Package,
        color: 'bg-purple-600',
      });
    }

    if (order.status === 'preparing') {
      actions.push({
        label: 'Ready for Pickup',
        status: 'ready_for_pickup' as OrderStatus,
        icon: CheckCircle,
        color: 'bg-indigo-600',
      });
      actions.push({
        label: 'Out for Delivery',
        status: 'out_for_delivery' as OrderStatus,
        icon: Truck,
        color: 'bg-orange-600',
      });
    }

    if (order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') {
      actions.push({
        label: 'Mark as Delivered',
        status: 'delivered' as OrderStatus,
        icon: CheckCircle,
        color: 'bg-green-600',
      });
    }

    return actions;
  };

  // Handle quick action
  const handleQuickAction = (status: OrderStatus) => {
    Alert.alert(
      'Confirm Action',
      `Update order status to "${status.replace(/_/g, ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await handleUpdateStatus(status);
              Alert.alert('Success', 'Order status updated successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
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

  const quickActions = getQuickActions();
  const canUpdateStatus = !['delivered', 'cancelled', 'refunded'].includes(order.status);

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
            Order Management
          </Text>
        </TouchableOpacity>

        {/* Order number and status */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {order.orderNumber}
          </Text>
          <OrderStatusBadge status={order.status} size="lg" />
        </View>

        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Placed on {formatDate(order.createdAt)}
        </Text>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.status}
                  onPress={() => handleQuickAction(action.status)}
                  className={`flex-row items-center ${action.color} px-4 py-2 rounded-lg`}
                >
                  <Icon size={16} className="text-white mr-2" />
                  <Text className="text-white font-medium text-sm">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Update Status Button */}
        {canUpdateStatus && (
          <Button
            label="Update Order Status"
            onPress={() => setShowStatusModal(true)}
            variant="outline"
            className="flex-row items-center justify-center"
          />
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer Information */}
        <View className="bg-white dark:bg-gray-800 mb-3 p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Customer Information
          </Text>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </Text>
            <Text className="text-base text-gray-900 dark:text-white">
              {order.customerName}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </Text>
            <TouchableOpacity onPress={() => handleEmail(order.customerEmail)}>
              <View className="flex-row items-center">
                <Mail size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                <Text className="text-base text-blue-600 dark:text-blue-400">
                  {order.customerEmail}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </Text>
            <TouchableOpacity onPress={() => handleCall(order.customerPhone)}>
              <View className="flex-row items-center">
                <Phone size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                <Text className="text-base text-blue-600 dark:text-blue-400">
                  {order.customerPhone}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

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

        <View className="h-6" />
      </ScrollView>

      {/* Status Update Modal */}
      <OrderStatusUpdateModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={order.status}
        onUpdateStatus={handleUpdateStatus}
        loading={updateStatusMutation.isPending}
      />
    </View>
  );
}

export default function FarmOrderDetailScreen() {
  return (
    <RouteGuard requireFarmData={true} allowedRoles={['farm']}>
      <FarmOrderDetailContent />
    </RouteGuard>
  );
}

