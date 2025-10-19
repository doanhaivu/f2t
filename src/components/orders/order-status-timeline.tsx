import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Check, Clock, Package, Truck, MapPin, XCircle, RefreshCw } from 'lucide-react-native';

import type { OrderTimelineEvent, OrderStatus } from '@/api/orders/types';

type OrderStatusTimelineProps = {
  events: OrderTimelineEvent[];
  currentStatus: OrderStatus;
  className?: string;
  showLocation?: boolean;
  showNotes?: boolean;
  compact?: boolean;
};

// Status configuration with icons and colors
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
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get updatedBy badge color
const getUpdatedByColor = (updatedBy: OrderTimelineEvent['updatedBy']): string => {
  switch (updatedBy) {
    case 'customer':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'farm':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'delivery':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'system':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export function OrderStatusTimeline({
  events,
  currentStatus,
  className = '',
  showLocation = true,
  showNotes = true,
  compact = false,
}: OrderStatusTimelineProps) {
  // Sort events by timestamp (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (events.length === 0) {
    return (
      <View className={`p-4 ${className}`}>
        <Text className="text-center text-gray-500 dark:text-gray-400">
          No timeline events available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className={`${className}`} showsVerticalScrollIndicator={false}>
      <View className="px-4 py-2">
        {sortedEvents.map((event, index) => {
          const config = statusConfig[event.status];
          const Icon = config.icon;
          const isLast = index === sortedEvents.length - 1;
          const isCurrent = event.status === currentStatus;

          return (
            <View key={event.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <View 
                  className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                  style={{ marginLeft: -1 }}
                />
              )}

              {/* Event item */}
              <View className={`flex-row ${compact ? 'py-2' : 'py-3'}`}>
                {/* Icon */}
                <View 
                  className={`w-10 h-10 rounded-full ${config.bgColor} items-center justify-center ${
                    isCurrent ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''
                  }`}
                >
                  <Icon 
                    size={compact ? 18 : 20} 
                    className={config.color}
                  />
                </View>

                {/* Content */}
                <View className="flex-1 ml-3">
                  {/* Status and timestamp */}
                  <View className="flex-row items-center justify-between mb-1">
                    <Text 
                      className={`font-semibold ${
                        isCurrent 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      } ${compact ? 'text-sm' : 'text-base'}`}
                    >
                      {config.label}
                    </Text>
                    <Text 
                      className={`text-gray-500 dark:text-gray-400 ${
                        compact ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      {formatTimestamp(event.timestamp)}
                    </Text>
                  </View>

                  {/* Description */}
                  <Text 
                    className={`text-gray-600 dark:text-gray-400 mb-2 ${
                      compact ? 'text-xs' : 'text-sm'
                    }`}
                  >
                    {event.description}
                  </Text>

                  {/* Location */}
                  {showLocation && event.location && (
                    <View className="flex-row items-center mb-1">
                      <MapPin size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {event.location}
                      </Text>
                    </View>
                  )}

                  {/* Notes */}
                  {showNotes && event.notes && (
                    <View className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        {event.notes}
                      </Text>
                    </View>
                  )}

                  {/* Updated by badge */}
                  {!compact && (
                    <View className="mt-2">
                      <View 
                        className={`self-start px-2 py-0.5 rounded-full ${getUpdatedByColor(event.updatedBy)}`}
                      >
                        <Text className="text-xs font-medium capitalize">
                          {event.updatedBy}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
