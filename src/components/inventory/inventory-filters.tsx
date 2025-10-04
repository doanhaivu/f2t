import React, { useState } from 'react';
import { Pressable } from 'react-native';

import { Button, Input, Text, View } from '@/components/ui';
import { Select } from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/types/constants';
import { getCategoryLabel } from '@/api/products';

type InventoryFilters = {
  search: string;
  category: string;
  stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  status: 'all' | 'available' | 'sold_out' | 'unavailable';
  sortBy: 'name' | 'quantity' | 'price' | 'updated';
  sortOrder: 'asc' | 'desc';
};

type InventoryFiltersProps = {
  filters: InventoryFilters;
  onFiltersChange: (filters: Partial<InventoryFilters>) => void;
};

// Filter options
const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  ...Object.values(PRODUCT_CATEGORIES).map(category => ({
    label: getCategoryLabel(category),
    value: category,
  })),
];

const stockStatusOptions = [
  { label: 'All Stock Levels', value: 'all' },
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock (≤5)', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
];

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Sold Out', value: 'sold_out' },
  { label: 'Unavailable', value: 'unavailable' },
];

const sortByOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Price', value: 'price' },
  { label: 'Last Updated', value: 'updated' },
];

const sortOrderOptions = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
];

export const InventoryFilters = ({ filters, onFiltersChange }: InventoryFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ search });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      stockStatus: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.stockStatus !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  return (
    <View className="bg-white px-4 pb-4 dark:bg-gray-800">
      {/* Search bar */}
      <View className="mb-3">
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChangeText={handleSearchChange}
          className="w-full"
        />
      </View>

      {/* Quick filters */}
      <View className="mb-3 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => onFiltersChange({ stockStatus: 'low_stock' })}
          className={`rounded-full px-3 py-1 ${
            filters.stockStatus === 'low_stock'
              ? 'bg-yellow-100 dark:bg-yellow-900/20'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          <Text className={`text-sm font-medium ${
            filters.stockStatus === 'low_stock'
              ? 'text-yellow-800 dark:text-yellow-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            Low Stock
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onFiltersChange({ stockStatus: 'out_of_stock' })}
          className={`rounded-full px-3 py-1 ${
            filters.stockStatus === 'out_of_stock'
              ? 'bg-red-100 dark:bg-red-900/20'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          <Text className={`text-sm font-medium ${
            filters.stockStatus === 'out_of_stock'
              ? 'text-red-800 dark:text-red-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            Out of Stock
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onFiltersChange({ status: 'unavailable' })}
          className={`rounded-full px-3 py-1 ${
            filters.status === 'unavailable'
              ? 'bg-gray-200 dark:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          <Text className={`text-sm font-medium ${
            filters.status === 'unavailable'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            Inactive
          </Text>
        </Pressable>
      </View>

      {/* Advanced filters toggle */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center"
        >
          <Text className="mr-2 font-medium text-gray-700 dark:text-gray-300">
            Advanced Filters
          </Text>
          <Text className="text-gray-500 dark:text-gray-500">
            {isExpanded ? '−' : '+'}
          </Text>
        </Pressable>

        {hasActiveFilters && (
          <Button
            label="Clear All"
            onPress={handleClearFilters}
            variant="ghost"
            className="px-3 py-1"
          />
        )}
      </View>

      {/* Advanced filters */}
      {isExpanded && (
        <View className="mt-4 space-y-3">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </Text>
              <Select
                options={categoryOptions}
                value={filters.category}
                onSelect={(value) => onFiltersChange({ category: value as string })}
                placeholder="Select category"
              />
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Status
              </Text>
              <Select
                options={stockStatusOptions}
                value={filters.stockStatus}
                onSelect={(value) => onFiltersChange({ stockStatus: value as InventoryFilters['stockStatus'] })}
                placeholder="Select stock status"
              />
            </View>
          </View>

          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Status
              </Text>
              <Select
                options={statusOptions}
                value={filters.status}
                onSelect={(value) => onFiltersChange({ status: value as InventoryFilters['status'] })}
                placeholder="Select status"
              />
            </View>
          </View>

          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort By
              </Text>
              <Select
                options={sortByOptions}
                value={filters.sortBy}
                onSelect={(value) => onFiltersChange({ sortBy: value as InventoryFilters['sortBy'] })}
                placeholder="Sort by"
              />
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Order
              </Text>
              <Select
                options={sortOrderOptions}
                value={filters.sortOrder}
                onSelect={(value) => onFiltersChange({ sortOrder: value as InventoryFilters['sortOrder'] })}
                placeholder="Sort order"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
