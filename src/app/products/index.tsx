import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

import { Button, Text, View } from '@/components/ui';
import { ProductList, ProductSearch } from '@/components/products';
import { useGetProductsInfinite, searchProducts, filterProducts, sortProducts } from '@/api/products';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import type { ProductSearchFilters } from '@/api/products';
import type { Product } from '@/types';

// Custom hooks for better organization
const useProductFilters = () => {
  const params = useLocalSearchParams();
  
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

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: ProductSearchFilters = {
      search: (params.search as string) || '',
      category: (params.category as string) || 'all',
      priceRange: { min: 0, max: 1000 },
      organicOnly: params.organic === 'true',
      inSeason: params.inSeason === 'true',
      inStock: params.inStock !== 'false',
      sortBy: (params.sortBy as any) || 'name',
      sortOrder: (params.sortOrder as 'asc' | 'desc') || 'asc',
    };
    setFilters(initialFilters);
  }, [params]);

  const updateFilters = useCallback((newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilter = useCallback((filterKey: keyof ProductSearchFilters) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (filterKey === 'search') updated.search = '';
      else if (filterKey === 'category') updated.category = 'all';
      else if (filterKey === 'organicOnly') updated.organicOnly = false;
      else if (filterKey === 'inSeason') updated.inSeason = false;
      else if (filterKey === 'priceRange') updated.priceRange = { min: 0, max: 1000 };
      return updated;
    });
  }, []);

  const hasActiveFilters = filters.search || 
    filters.category !== 'all' || 
    filters.organicOnly || 
    filters.inSeason ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 1000;

  return { filters, updateFilters, clearFilter, hasActiveFilters };
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
  const cart = useCart();

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/products/${product.id}`);
  }, [router]);

  const handleAddToCart = useCallback((product: Product) => {
    cart.addItem(product, 1);
    // Show a toast or feedback (can be enhanced later)
  }, [cart]);

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

// Active Filters Chips Component
const ActiveFiltersChips = ({
  filters,
  onClearFilter,
  onClearAll,
}: {
  filters: ProductSearchFilters;
  onClearFilter: (key: keyof ProductSearchFilters) => void;
  onClearAll: () => void;
}) => {
  const activeFilters: Array<{ key: keyof ProductSearchFilters; label: string }> = [];

  if (filters.search) {
    activeFilters.push({ key: 'search', label: `Search: "${filters.search}"` });
  }
  if (filters.category && filters.category !== 'all') {
    activeFilters.push({ key: 'category', label: `Category: ${filters.category}` });
  }
  if (filters.organicOnly) {
    activeFilters.push({ key: 'organicOnly', label: 'Organic Only' });
  }
  if (filters.inSeason) {
    activeFilters.push({ key: 'inSeason', label: 'In Season' });
  }
  if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
    activeFilters.push({ 
      key: 'priceRange', 
      label: `$${filters.priceRange.min} - $${filters.priceRange.max}` 
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <View className="bg-white px-4 py-2 dark:bg-gray-800">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center space-x-2">
          <Text className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Filters:
          </Text>
          {activeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => onClearFilter(filter.key)}
              className="mr-2 flex-row items-center rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30"
            >
              <Text className="mr-1 text-sm text-green-800 dark:text-green-300">
                {filter.label}
              </Text>
              <X size={14} color="#166534" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={onClearAll}
            className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700"
          >
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
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
  const { filters, updateFilters, clearFilter, hasActiveFilters } = useProductFilters();
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

  const handleClearAllFilters = useCallback(() => {
    updateFilters({
      search: '',
      category: 'all',
      priceRange: { min: 0, max: 1000 },
      organicOnly: false,
      inSeason: false,
      inStock: true,
      sortBy: 'name',
      sortOrder: 'asc',
    });
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
          canAddProducts={canAddProducts()}
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

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <ActiveFiltersChips
          filters={filters}
          onClearFilter={clearFilter}
          onClearAll={handleClearAllFilters}
        />
      )}

      {/* Product List */}
      <View className="flex-1">
        <ProductList
          products={products}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          layout={layout}
          showFarmInfo={true}
          showAddToCart={!canAddProducts()} // Hide add to cart for farm users
          loading={false}
          error={null}
          emptyMessage={
            hasActiveFilters
              ? "No products match your filters. Try adjusting your search criteria."
              : "No products available yet. Check back soon!"
          }
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
