import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Check } from 'lucide-react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { Modal, useModal } from '@/components/ui/modal';
import { Button } from '@/components/ui';
import type { OrderStatus } from '@/api/orders/types';
import { getStatusLabel, getStatusBgColor, getStatusColor } from './order-status-badge';

type OrderStatusUpdateModalProps = {
  visible: boolean;
  onClose: () => void;
  currentStatus: OrderStatus;
  onUpdateStatus: (newStatus: OrderStatus, notes?: string) => Promise<void>;
  loading?: boolean;
};

// Define valid status transitions for farms
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

// Status descriptions
const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'Order is waiting for confirmation',
  confirmed: 'Order has been confirmed and will be prepared',
  preparing: 'Order is being prepared',
  ready_for_pickup: 'Order is ready for customer pickup',
  out_for_delivery: 'Order is on the way to customer',
  delivered: 'Order has been delivered to customer',
  cancelled: 'Order has been cancelled',
  refunded: 'Order has been refunded',
};

export function OrderStatusUpdateModal({
  visible,
  onClose,
  currentStatus,
  onUpdateStatus,
  loading = false,
}: OrderStatusUpdateModalProps) {
  const { ref, present, dismiss } = useModal();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      present();
    } else {
      dismiss();
    }
  }, [visible, present, dismiss]);

  // Get available status transitions
  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  // Handle status update
  const handleUpdate = async () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    // Confirm critical actions
    if (selectedStatus === 'cancelled' || selectedStatus === 'refunded') {
      Alert.alert(
        'Confirm Action',
        `Are you sure you want to ${selectedStatus === 'cancelled' ? 'cancel' : 'refund'} this order?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
              await performUpdate();
            },
          },
        ]
      );
    } else {
      await performUpdate();
    }
  };

  const performUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      await onUpdateStatus(selectedStatus, notes || undefined);
      
      // Reset state
      setSelectedStatus(null);
      setNotes('');
      dismiss();
      onClose();
      
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isUpdating) {
      setSelectedStatus(null);
      setNotes('');
      dismiss();
      onClose();
    }
  };

  return (
    <Modal 
      ref={ref}
      snapPoints={['80%']}
      onDismiss={handleClose}
    >
      <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[80vh]">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Update Order Status
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Current status: <Text className="font-semibold">{getStatusLabel(currentStatus)}</Text>
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Available Status Options */}
          {availableStatuses.length > 0 ? (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select New Status
              </Text>
              
              {availableStatuses.map((status) => {
                const isSelected = selectedStatus === status;
                const bgColor = getStatusBgColor(status);
                const textColor = getStatusColor(status);
                
                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setSelectedStatus(status)}
                    className={`mb-3 p-4 rounded-lg border-2 ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View className={`px-3 py-1 rounded-full ${bgColor} mr-3`}>
                          <Text className={`text-sm font-medium ${textColor}`}>
                            {getStatusLabel(status)}
                          </Text>
                        </View>
                        {isSelected && (
                          <View className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full items-center justify-center">
                            <Check size={16} className="text-white" />
                          </View>
                        )}
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {STATUS_DESCRIPTIONS[status]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                No status updates available for this order
              </Text>
            </View>
          )}

          {/* Notes Input */}
          {selectedStatus && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes {selectedStatus === 'cancelled' || selectedStatus === 'refunded' ? '(Required)' : '(Optional)'}
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={
                  selectedStatus === 'cancelled'
                    ? 'Reason for cancellation...'
                    : selectedStatus === 'refunded'
                    ? 'Reason for refund...'
                    : 'Add any notes about this status change...'
                }
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white min-h-[100px]"
                textAlignVertical="top"
              />
              {(selectedStatus === 'cancelled' || selectedStatus === 'refunded') && !notes && (
                <Text className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Please provide a reason
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Button
                label="Cancel"
                onPress={handleClose}
                variant="outline"
                disabled={isUpdating || loading}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Update Status"
                onPress={handleUpdate}
                disabled={
                  !selectedStatus ||
                  isUpdating ||
                  loading ||
                  ((selectedStatus === 'cancelled' || selectedStatus === 'refunded') && !notes)
                }
                loading={isUpdating || loading}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

