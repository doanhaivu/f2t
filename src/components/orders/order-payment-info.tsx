import React from 'react';

import { Text, View } from '@/components/ui';
import type { Order } from '@/api/orders';
import { formatPrice } from '@/api/products';

type OrderPaymentInfoProps = {
  order: Order;
};

export function OrderPaymentInfo({ order }: OrderPaymentInfoProps) {
  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payment Information
      </Text>
      
      <View className="space-y-4">
        {/* Payment Method */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Payment Method
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {getPaymentMethodText(order.paymentMethod)}
          </Text>
        </View>

        {/* Payment Status */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Payment Status
          </Text>
          <View className="flex-row items-center space-x-2">
            <View className={`w-2 h-2 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`} />
            <Text className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus).replace('bg-', 'text-')}`}>
              {getPaymentStatusText(order.paymentStatus)}
            </Text>
          </View>
        </View>

        {/* Payment Amount */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Payment Amount
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(order.total)}
          </Text>
        </View>

        {/* Order Date */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Order Date
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Refund Information */}
        {order.refundAmount && order.refundAmount > 0 && (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <Text className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Refund Information
            </Text>
            <Text className="text-sm text-red-700 dark:text-red-300">
              Refund Amount: {formatPrice(order.refundAmount)}
            </Text>
            <Text className="text-sm text-red-700 dark:text-red-300">
              Refund Date: {new Date(order.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {order.refundReason && (
              <Text className="text-sm text-red-700 dark:text-red-300">
                Reason: {order.refundReason}
              </Text>
            )}
          </View>
        )}

        {/* Billing Address */}
        <View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Billing Address
          </Text>
          <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.billingAddress.firstName} {order.billingAddress.lastName}
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.billingAddress.addressLine1}
            </Text>
            {order.billingAddress.addressLine2 && (
              <Text className="text-sm text-gray-900 dark:text-white">
                {order.billingAddress.addressLine2}
              </Text>
            )}
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
            </Text>
            <Text className="text-sm text-gray-900 dark:text-white">
              {order.billingAddress.country}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Phone: {order.billingAddress.phoneNumber}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function getPaymentMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    digital_wallet: 'Digital Wallet',
    cash_on_delivery: 'Cash on Delivery',
  };
  
  return methodMap[method] || method;
}

function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Payment Pending',
    processing: 'Processing Payment',
    completed: 'Payment Completed',
    failed: 'Payment Failed',
    cancelled: 'Payment Cancelled',
    refunded: 'Payment Refunded',
  };
  
  return statusMap[status] || status;
}

function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-gray-500',
    refunded: 'bg-purple-500',
  };
  
  return colorMap[status] || 'bg-gray-500';
}
