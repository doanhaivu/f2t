import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { View, Text, Button, Input } from '@/components/ui';
import { useGetFarm } from '@/api/farms';

// Mock product type for now
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  imageUrl?: string;
};

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    description: 'Fresh, vine-ripened organic tomatoes',
    price: 4.99,
    unit: 'lb',
    category: 'Vegetables',
    inStock: true,
  },
  {
    id: '2',
    name: 'Free-Range Eggs',
    description: 'Farm-fresh eggs from free-range chickens',
    price: 6.99,
    unit: 'dozen',
    category: 'Dairy & Eggs',
    inStock: true,
  },
  {
    id: '3',
    name: 'Organic Lettuce',
    description: 'Crisp organic lettuce, perfect for salads',
    price: 3.49,
    unit: 'head',
    category: 'Vegetables',
    inStock: false,
  },
];

export default function FarmProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch farm data to show farm name
  const { data: farmResponse, isLoading: farmLoading } = useGetFarm({ variables: { id: id! } });
  const farm = farmResponse?.data;

  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleProductPress = (product: Product) => {
    // Navigate to product details
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    // Add to cart functionality
    console.log('Adding to cart:', product.name);
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </Text>
          <Text className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {product.description}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-500">
            Category: {product.category}
          </Text>
        </View>
        
        <View className="ml-4 h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700">
          {/* Product image placeholder */}
          <View className="flex-1 items-center justify-center">
            <Text className="text-xs text-gray-500 dark:text-gray-400">IMG</Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-green-600 dark:text-green-400">
            ${product.price.toFixed(2)}
          </Text>
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            / {product.unit}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <View className={`rounded-full px-2 py-1 ${
            product.inStock 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            <Text className={`text-xs font-medium ${
              product.inStock 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
          
          <Button
            label="Add to Cart"
            onPress={() => handleAddToCart(product)}
            disabled={!product.inStock}
            className="px-4"
          />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="mb-2 text-6xl">🛒</Text>
      <Text className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        No Products Found
      </Text>
      <Text className="max-w-sm text-center text-gray-600 dark:text-gray-400">
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'This farm hasn\'t added any products yet'
        }
      </Text>
    </View>
  );

  if (farmLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-gray-600 dark:text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white p-4 dark:bg-gray-800">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Products
            </Text>
            {farm && (
              <Text className="text-gray-600 dark:text-gray-400">
                from {farm.name}
              </Text>
            )}
          </View>
          
          <Button
            label="Back to Farm"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
        
        {/* Search */}
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mb-0"
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View className="h-2" />}
      />
    </View>
  );
}
