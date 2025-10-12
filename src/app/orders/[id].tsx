import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, RefreshControl } from 'react-native';

import { View, ScrollView } from '@/components/ui';
import { useGetOrder } from '@/api/orders';
import { useAuth } from '@/lib/auth';
import { ConsumerRouteGuard } from '@/components/auth';
import { OrderConfirmation } from '@/components/orders';

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth.use;

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useGetOrder({
    variables: { id: id! },
  });

  const order = orderResponse?.data;

  const handleRefresh = () => {
    refetch();
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewProducts = () => {
    router.push('/products');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact support?',
      [
        { text: 'Email', onPress: () => console.log('Email support') },
        { text: 'Phone', onPress: () => console.log('Phone support') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <OrderConfirmation
          order={undefined}
          isLoading={true}
          onBack={handleBack}
          onViewProducts={handleViewProducts}
          onContactSupport={handleContactSupport}
        />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <OrderConfirmation
          order={undefined}
          isLoading={false}
          error={error?.message || 'Order not found'}
          onBack={handleBack}
          onViewProducts={handleViewProducts}
          onContactSupport={handleContactSupport}
        />
      </View>
    );
  }

  return (
    <ConsumerRouteGuard>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        >
          <OrderConfirmation
            order={order}
            isLoading={false}
            onBack={handleBack}
            onViewProducts={handleViewProducts}
            onContactSupport={handleContactSupport}
          />
        </ScrollView>
      </View>
    </ConsumerRouteGuard>
  );
};

export default OrderDetailScreen;
