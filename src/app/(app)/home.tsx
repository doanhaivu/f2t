import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View, Image } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function HomeScreen() {
  const router = useRouter();
  const isFarm = useAuth.use.isFarm;
  const isUserFarm = isFarm(); // Call the function

  // If farm user, redirect to dashboard
  if (isUserFarm()) {
    router.replace('/dashboard');
    return null;
  }

  const quickActions = [
    {
      id: 'browse-farms',
      title: 'Browse Farms',
      icon: '🚜',
      description: 'Discover local farms near you',
      onPress: () => router.push('/farms'),
    },
    {
      id: 'shop-products',
      title: 'Shop Products',
      icon: '🥬',
      description: 'Fresh produce and more',
      onPress: () => router.push('/products'),
    },
    {
      id: 'my-orders',
      title: 'My Orders',
      icon: '📦',
      description: 'Track your orders',
      onPress: () => router.push('/orders'),
    },
    {
      id: 'cart',
      title: 'Shopping Cart',
      icon: '🛒',
      description: 'View your cart',
      onPress: () => router.push('/(app)/cart'),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <View className="bg-green-600 p-6 dark:bg-green-700">
        <Text className="mb-2 text-3xl font-bold text-white">
          Welcome to Farm Marketplace
        </Text>
        <Text className="text-lg text-green-100">
          Fresh produce directly from local farms
        </Text>
      </View>

      {/* Quick Actions */}
      <View className="p-4">
        <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </Text>
        <View className="space-y-3">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={action.onPress}
              className="flex-row items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
            >
              <Text className="mr-4 text-4xl">{action.icon}</Text>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View className="p-4">
        <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Why Choose Us?
        </Text>
        <View className="space-y-4">
          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">🌱</Text>
            <View className="flex-1">
              <Text className="mb-1 font-semibold text-gray-900 dark:text-white">
                Fresh & Local
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Get the freshest produce directly from local farms
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">🚚</Text>
            <View className="flex-1">
              <Text className="mb-1 font-semibold text-gray-900 dark:text-white">
                Fast Delivery
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Quick delivery from farms within 100km radius
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">💚</Text>
            <View className="flex-1">
              <Text className="mb-1 font-semibold text-gray-900 dark:text-white">
                Support Local
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Help local farmers and strengthen your community
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">✅</Text>
            <View className="flex-1">
              <Text className="mb-1 font-semibold text-gray-900 dark:text-white">
                Quality Guaranteed
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                All products are quality-checked and certified
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

