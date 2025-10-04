import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';

import { Button, Text, View } from '@/components/ui';
import { ProductList, ProductSearch } from '@/components/products';
import { useGetProductsInfinite, searchProducts, filterProducts, sortProducts } from '@/api/products';
import { useAuth } from '@/lib/auth';
import type { ProductSearchFilters } from '@/api/products';
import type { Product } from '@/types';

// Custom hooks for better organization
const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductSearchFilters>({
    search: '',
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    organicOnly: false,
    inSeason: false,
    inStock: true,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const updateFilters = useCallback((newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
  }, []);

  return { filters, updateFilters };
};

const useProductData = (filters: ProductSearchFilters) => {
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProductsInfinite({
    variables: {
      search: filters.search,
      category: filters.category !== 'all' ? filters.category : undefined,
      minPrice: filters.priceRange.min,
      maxPrice: filters.priceRange.max,
      organicOnly: filters.organicOnly,
      inSeason: filters.inSeason,
      inStock: filters.inStock,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: 20,
    },
  });

  // Extract and process products from paginated response
  const allProducts = productsResponse?.pages?.flatMap(page => 
    page.success ? page.data?.products || [] : []
  ) || [];

  // Apply client-side filtering and sorting for additional refinement
  let processedProducts = allProducts;

  if (filters.search) {
    processedProducts = searchProducts(processedProducts, filters.search);
  }

  processedProducts = filterProducts(processedProducts, {
    category: filters.category !== 'all' ? filters.category : undefined,
    priceRange: filters.priceRange,
    organicOnly: filters.organicOnly,
    inSeason: filters.inSeason,
    inStock: filters.inStock,
  });

  processedProducts = sortProducts(processedProducts, filters.sortBy, filters.sortOrder);

  return {
    products: processedProducts,
    isLoading,
    error: error?.message || null,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount: productsResponse?.pages?.[0]?.success ? (productsResponse.pages[0].data as any)?.total || 0 : 0,
  };
};

const useProductActions = () => {
  const router = useRouter();
  const isFarm = useAuth.use.isFarm();

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/products/${product.id}`);
  }, [router]);

  const handleAddToCart = useCallback((product: Product) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product.name);
  }, []);

  const handleAddProduct = useCallback(() => {
    router.push('/products/add');
  }, [router]);

  const handleEditProduct = useCallback((product: Product) => {
    router.push(`/products/${product.id}/edit`);
  }, [router]);

  return {
    handleProductPress,
    handleAddToCart,
    handleAddProduct,
    handleEditProduct,
    canAddProducts: isFarm,
  };
};

// Header component
const ProductListHeader = ({ 
  totalCount, 
  canAddProducts, 
  onAddProduct,
  layout,
  onLayoutChange 
}: {
  totalCount: number;
  canAddProducts: boolean;
  onAddProduct: () => void;
  layout: 'vertical' | 'horizontal' | 'grid';
  onLayoutChange: (layout: 'vertical' | 'horizontal' | 'grid') => void;
}) => (
  <View className="mb-4 flex-row items-center justify-between">
    <View>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Products
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {totalCount} products available
      </Text>
    </View>

    <View className="flex-row space-x-2">
      {/* Layout Toggle Buttons */}
      <View className="flex-row rounded-lg border border-gray-300 dark:border-gray-600">
        <Button
          label="📋"
          onPress={() => onLayoutChange('vertical')}
          variant={layout === 'vertical' ? 'default' : 'ghost'}
          className="rounded-r-none px-3 py-2"
        />
        <Button
          label="📊"
          onPress={() => onLayoutChange('grid')}
          variant={layout === 'grid' ? 'default' : 'ghost'}
          className="rounded-none border-x border-gray-300 px-3 py-2 dark:border-gray-600"
        />
        <Button
          label="➡️"
          onPress={() => onLayoutChange('horizontal')}
          variant={layout === 'horizontal' ? 'default' : 'ghost'}
          className="rounded-l-none px-3 py-2"
        />
      </View>

      {/* Add Product Button (Farm users only) */}
      {canAddProducts && (
        <Button
          label="+ Add Product"
          onPress={onAddProduct}
          variant="default"
        />
      )}
    </View>
  </View>
);

// Loading state component
const ProductListLoading = ({ layout }: { layout: 'vertical' | 'horizontal' | 'grid' }) => (
  <View className="flex-1">
    <View className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    <View className="mb-6 h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    <ProductList
      products={[]}
      layout={layout}
      loading={true}
    />
  </View>
);

// Error state component
const ProductListError = ({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void; 
}) => (
  <View className="flex-1 items-center justify-center py-12">
    <Text className="mb-4 text-6xl">⚠️</Text>
    <Text className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
      Failed to load products
    </Text>
    <Text className="mb-4 text-center text-gray-600 dark:text-gray-400">
      {error}
    </Text>
    <Button
      label="Try Again"
      onPress={onRetry}
      variant="default"
    />
  </View>
);

// Main component
export default function ProductListScreen() {
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
  const { filters, updateFilters } = useProductFilters();
  const { 
    products, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    totalCount 
  } = useProductData(filters);
  const { 
    handleProductPress, 
    handleAddToCart, 
    handleAddProduct, 
    canAddProducts 
  } = useProductActions();

  const handleSearch = useCallback((newFilters: ProductSearchFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-gray-900">
        <ProductListLoading layout={layout} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-gray-900">
        <ProductListError error={error} onRetry={handleRefresh} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white p-4 dark:bg-gray-800">
        <ProductListHeader
          totalCount={totalCount}
          canAddProducts={canAddProducts}
          onAddProduct={handleAddProduct}
          layout={layout}
          onLayoutChange={setLayout}
        />
      </View>

      {/* Search and Filters */}
      <ProductSearch
        onSearch={handleSearch}
        initialFilters={filters}
        showAdvancedFilters={true}
        loading={isLoading || isFetchingNextPage}
      />

      {/* Product List */}
      <View className="flex-1">
        <ProductList
          products={products}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          layout={layout}
          showFarmInfo={true}
          showAddToCart={!canAddProducts} // Hide add to cart for farm users
          loading={false}
          error={null}
          emptyMessage="No products found. Try adjusting your search or filters."
          onRefresh={handleRefresh}
          refreshing={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
        />
      </View>

      {/* Loading indicator for pagination */}
      {isFetchingNextPage && (
        <View className="items-center py-4">
          <Text className="text-gray-600 dark:text-gray-400">Loading more products...</Text>
        </View>
      )}
    </View>
  );
}
