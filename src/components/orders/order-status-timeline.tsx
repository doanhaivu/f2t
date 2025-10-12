import React from 'react';

import { Text, View } from '@/components/ui';
import type { Order } from '@/api/orders';
import { calculateOrderProgress } from '@/api/orders';

type OrderStatusTimelineProps = {
  order: Order;
};

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const progress = calculateOrderProgress(order.status);
  
  const statusSteps = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      completed: progress >= 1,
      active: order.status === 'pending',
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      description: 'Your order has been confirmed by the farm',
      completed: progress >= 2,
      active: order.status === 'confirmed',
    },
    {
      key: 'preparing',
      label: 'Preparing',
      description: 'Your order is being prepared for delivery',
      completed: progress >= 3,
      active: order.status === 'preparing',
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'Your order is on its way',
      completed: progress >= 4,
      active: order.status === 'out_for_delivery',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Your order has been delivered',
      completed: progress >= 5,
      active: order.status === 'delivered',
    },
  ];

  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Progress
      </Text>
      
      <View className="space-y-4">
        {statusSteps.map((step, index) => (
          <StatusStep
            key={step.key}
            step={step}
            isLast={index === statusSteps.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

type StatusStepProps = {
  step: {
    key: string;
    label: string;
    description: string;
    completed: boolean;
    active: boolean;
  };
  isLast: boolean;
};

function StatusStep({ step, isLast }: StatusStepProps) {
  const getStepIcon = () => {
    if (step.completed) {
      return '✅';
    }
    if (step.active) {
      return '⏳';
    }
    return '⭕';
  };

  const getStepColor = () => {
    if (step.completed) {
      return 'text-green-600 dark:text-green-400';
    }
    if (step.active) {
      return 'text-blue-600 dark:text-blue-400';
    }
    return 'text-gray-400 dark:text-gray-500';
  };

  return (
    <View className="flex-row">
      {/* Timeline line and icon */}
      <View className="items-center mr-4">
        <View className={`w-8 h-8 rounded-full items-center justify-center ${
          step.completed 
            ? 'bg-green-100 dark:bg-green-900/20' 
            : step.active 
            ? 'bg-blue-100 dark:bg-blue-900/20'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <Text className="text-sm">{getStepIcon()}</Text>
        </View>
        {!isLast && (
          <View className={`w-0.5 h-8 mt-2 ${
            step.completed 
              ? 'bg-green-300 dark:bg-green-700' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`} />
        )}
      </View>

      {/* Step content */}
      <View className="flex-1 pb-4">
        <Text className={`text-sm font-medium ${getStepColor()}`}>
          {step.label}
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {step.description}
        </Text>
        
        {/* Show estimated time for active step */}
        {step.active && (
          <Text className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Estimated completion: {getEstimatedTime(step.key)}
          </Text>
        )}
      </View>
    </View>
  );
}

function getEstimatedTime(stepKey: string): string {
  const timeEstimates: Record<string, string> = {
    pending: '5-10 minutes',
    confirmed: '1-2 hours',
    preparing: '2-4 hours',
    shipped: '1-2 days',
    delivered: 'Completed',
  };
  
  return timeEstimates[stepKey] || 'Unknown';
}
