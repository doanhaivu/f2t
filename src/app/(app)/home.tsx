import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import { Text, View, Image, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useGetProducts } from '@/api/products';
import { useGetFarms } from '@/api/farms';
import { ProductCard } from '@/components/products/product-card';
import { FarmCard } from '@/components/farms/farm-card';
import { useLocation } from '@/lib/hooks/use-location';
import { PRODUCT_CATEGORY } from '@/types/constants';

export default function HomeScreen() {
  const router = useRouter();
  const isFarm = useAuth.use.isFarm;
  const isUserFarm = isFarm(); // Call the function
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Get user location
  const { coordinates: location, isLoading: isLocationLoading } = useLocation();

  // Fetch featured products (limit 6)
  const { data: productsData, isLoading: isProductsLoading, refetch: refetchProducts } = useGetProducts({
    variables: { page: 1, limit: 6 },
  });

  // Fetch nearby farms (limit 4) - using infinite query
  const { data: farmsData, isLoading: isFarmsLoading, refetch: refetchFarms } = useGetFarms({
    variables: { 
      limit: 4,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 100, // 100km radius
      } : undefined,
    },
  });

  // If farm user, redirect to dashboard
  if (isUserFarm()) {
    router.replace('/dashboard');
    return null;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchFarms()]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { id: 'vegetables', label: 'Vegetables', icon: '🥬', value: PRODUCT_CATEGORY.VEGETABLES },
    { id: 'fruits', label: 'Fruits', icon: '🍎', value: PRODUCT_CATEGORY.FRUITS },
    { id: 'dairy', label: 'Dairy', icon: '🥛', value: PRODUCT_CATEGORY.DAIRY },
    { id: 'meat', label: 'Meat', icon: '🥩', value: PRODUCT_CATEGORY.MEAT },
  ];

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Hero Section with Search */}
      <View className="bg-green-600 p-6 dark:bg-green-700">
        <Text className="mb-2 text-3xl font-bold text-white">
          Welcome to Farm Marketplace
        </Text>
        <Text className="mb-4 text-lg text-green-100">
          Fresh produce directly from local farms
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-lg bg-white p-3 dark:bg-gray-800">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 text-gray-900 dark:text-white"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Category Quick Filters */}
      <View className="p-4">
        <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
          Shop by Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push(`/products?category=${category.value}`)}
              className="mr-3 items-center rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800"
            >
              <Text className="mb-1 text-3xl">{category.icon}</Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Featured Products
          </Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text className="text-sm font-medium text-green-600 dark:text-green-400">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {isProductsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" />
            <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading products...</Text>
          </View>
        ) : productsData?.data?.products && productsData.data.products.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            {productsData.data.products.map((product) => (
              <View key={product.id} className="mr-3 w-48">
                <ProductCard
                  product={product}
                  variant="compact"
                  onPress={() => router.push(`/products/${product.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="items-center rounded-lg bg-gray-50 py-8 dark:bg-gray-800">
            <Text className="text-gray-500 dark:text-gray-400">No products available</Text>
          </View>
        )}
      </View>

      {/* Nearby Farms */}
      <View className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Farms Near You
          </Text>
          <TouchableOpacity onPress={() => router.push('/farms')}>
            <Text className="text-sm font-medium text-green-600 dark:text-green-400">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {isFarmsLoading || isLocationLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" />
            <Text className="mt-2 text-gray-500 dark:text-gray-400">
              {isLocationLoading ? 'Getting your location...' : 'Loading farms...'}
            </Text>
          </View>
        ) : farmsData?.pages?.[0]?.data?.farms && farmsData.pages[0].data.farms.length > 0 ? (
          <View className="space-y-3">
            {farmsData.pages[0].data.farms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                variant="compact"
                onPress={() => router.push(`/farms/${farm.id}`)}
                showDistance={!!location}
                userLocation={location || undefined}
              />
            ))}
          </View>
        ) : (
          <View className="items-center rounded-lg bg-gray-50 py-8 dark:bg-gray-800">
            <Text className="text-gray-500 dark:text-gray-400">
              {location ? 'No farms found nearby' : 'Enable location to see nearby farms'}
            </Text>
          </View>
        )}
      </View>

      {/* Features Section */}
      <View className="p-4 pb-8">
        <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
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

