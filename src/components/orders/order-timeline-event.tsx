import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Clock, Package, Truck, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react-native';

import type { OrderTimelineEvent, OrderStatus } from '@/api/orders/types';

type OrderTimelineEventProps = {
  event: OrderTimelineEvent;
  isLast?: boolean;
  isCurrent?: boolean;
  showDetails?: boolean;
  onPress?: () => void;
  className?: string;
};

// Status configuration
const statusConfig: Record<OrderStatus, { 
  icon: React.ComponentType<any>; 
  color: string;
  bgColor: string;
  label: string;
}> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    label: 'Pending',
  },
  confirmed: {
    icon: Check,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    label: 'Confirmed',
  },
  preparing: {
    icon: Package,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    label: 'Preparing',
  },
  ready_for_pickup: {
    icon: Package,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    label: 'Ready for Pickup',
  },
  out_for_delivery: {
    icon: Truck,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    label: 'Out for Delivery',
  },
  delivered: {
    icon: Check,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    label: 'Delivered',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    label: 'Cancelled',
  },
  refunded: {
    icon: RefreshCw,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    label: 'Refunded',
  },
};

// Format timestamp
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function OrderTimelineEvent({
  event,
  isLast = false,
  isCurrent = false,
  showDetails = false,
  onPress,
  className = '',
}: OrderTimelineEventProps) {
  const [expanded, setExpanded] = React.useState(showDetails);
  const config = statusConfig[event.status];
  const Icon = config.icon;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setExpanded(!expanded);
    }
  };

  const hasExpandableContent = event.location || event.notes;

  return (
    <View className={`relative ${className}`}>
      {/* Timeline line */}
      {!isLast && (
        <View 
          className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
          style={{ marginLeft: -1 }}
        />
      )}

      {/* Event content */}
      <TouchableOpacity
        onPress={hasExpandableContent ? handlePress : undefined}
        disabled={!hasExpandableContent}
        activeOpacity={hasExpandableContent ? 0.7 : 1}
      >
        <View className="flex-row py-3">
          {/* Icon */}
          <View 
            className={`w-10 h-10 rounded-full ${config.bgColor} items-center justify-center ${
              isCurrent ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''
            }`}
          >
            <Icon size={20} className={config.color} />
          </View>

          {/* Content */}
          <View className="flex-1 ml-3">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center flex-1">
                <Text 
                  className={`font-semibold ${
                    isCurrent 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {config.label}
                </Text>
                {isCurrent && (
                  <View className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Current
                    </Text>
                  </View>
                )}
              </View>
              {hasExpandableContent && (
                expanded ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )
              )}
            </View>

            {/* Timestamp */}
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(event.timestamp)}
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 mx-2">•</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(event.timestamp)}
              </Text>
            </View>

            {/* Description */}
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {event.description}
            </Text>

            {/* Updated by */}
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                Updated by{' '}
                <Text className="font-medium capitalize">{event.updatedBy}</Text>
              </Text>
            </View>

            {/* Expandable details */}
            {expanded && hasExpandableContent && (
              <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {event.location && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {event.location}
                    </Text>
                  </View>
                )}
                {event.notes && (
                  <View>
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {event.notes}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

