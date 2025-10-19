import React from 'react';
import { useRouter } from 'expo-router';

import { NotificationList } from '@/components/notifications';
import { useAuth } from '@/lib/auth';
import type { Notification } from '@/api/notifications/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const getUser = useAuth.use.user;
  const user = getUser();

  const handleNotificationPress = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.type.startsWith('order_')) {
      const orderId = notification.data?.orderId;
      if (orderId) {
        router.push(`/orders/${orderId}`);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <NotificationList
      userId={user.id}
      onNotificationPress={handleNotificationPress}
    />
  );
}

