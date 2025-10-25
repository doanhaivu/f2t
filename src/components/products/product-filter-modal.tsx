import React, { useState, useCallback } from 'react';
import { Modal, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

import { Button, Text, View } from '@/components/ui';
import { PRODUCT_CATEGORY, PRODUCT_CATEGORY_LABELS } from '@/types/constants';
import type { ProductCategory } from '@/types';
import { useLocation } from '@/lib/hooks/use-location';

export type ProductFilterOptions = {
  categories: ProductCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  organicOnly: boolean;
  inSeason: boolean;
  inStock: boolean;
  maxDistance?: number; // in km
  sortBy: 'name' | 'price' | 'distance' | 'harvestDate' | 'popularity';
  sortOrder: 'asc' | 'desc';
};

type ProductFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProductFilterOptions) => void;
  initialFilters?: Partial<ProductFilterOptions>;
  showLocationFilter?: boolean;
  showSortOptions?: boolean;
};

const DEFAULT_FILTERS: ProductFilterOptions = {
  categories: [],
  priceRange: {
    min: 0,
    max: 500000, // VND
  },
  organicOnly: false,
  inSeason: false,
  inStock: true,
  sortBy: 'name',
  sortOrder: 'asc',
};

// Price range presets (VND)
const PRICE_RANGES = [
  { label: 'Under 50k', min: 0, max: 50000 },
  { label: '50k - 100k', min: 50000, max: 100000 },
  { label: '100k - 150k', min: 100000, max: 150000 },
  { label: '150k - 250k', min: 150000, max: 250000 },
  { label: 'Over 250k', min: 250000, max: 500000 },
];

// Distance presets
const DISTANCE_RANGES = [
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
  { label: 'Within 50 km', value: 50 },
  { label: 'Within 100 km', value: 100 },
  { label: 'Any distance', value: undefined },
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name', order: 'asc' as const },
  { label: 'Name (Z-A)', value: 'name', order: 'desc' as const },
  { label: 'Price (Low to High)', value: 'price', order: 'asc' as const },
  { label: 'Price (High to Low)', value: 'price', order: 'desc' as const },
  { label: 'Nearest First', value: 'distance', order: 'asc' as const },
  { label: 'Recently Harvested', value: 'harvestDate', order: 'desc' as const },
  { label: 'Most Popular', value: 'popularity', order: 'desc' as const },
];

export function ProductFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
  showLocationFilter = true,
  showSortOptions = true,
}: ProductFilterModalProps) {
  const [filters, setFilters] = useState<ProductFilterOptions>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const { coordinates: location, isLoading: isLocationLoading } = useLocation();

  // Category selection
  const toggleCategory = useCallback((category: ProductCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  // Price range selection
  const setPriceRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max },
    }));
  }, []);

  // Distance selection
  const setMaxDistance = useCallback((distance: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      maxDistance: distance,
    }));
  }, []);

  // Sort selection
  const setSort = useCallback((sortBy: ProductFilterOptions['sortBy'], sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
  }, []);

  // Toggle filters
  const toggleFilter = useCallback((key: 'organicOnly' | 'inSeason' | 'inStock') => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Reset filters
  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Apply filters
  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  // Count active filters
  const activeFilterCount = 
    filters.categories.length +
    (filters.organicOnly ? 1 : 0) +
    (filters.inSeason ? 1 : 0) +
    (!filters.inStock ? 1 : 0) +
    (filters.maxDistance !== undefined ? 1 : 0) +
    (filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
     filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="max-h-[85%] rounded-t-3xl bg-white dark:bg-gray-900">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Filters
              </Text>
              {activeFilterCount > 0 && (
                <View className="rounded-full bg-primary px-2 py-0.5">
                  <Text className="text-xs font-bold text-white">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </View>
            
            <Pressable onPress={onClose} className="p-2">
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Categories
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(PRODUCT_CATEGORY).map(([key, value]) => {
                  const isSelected = filters.categories.includes(value as ProductCategory);
                  return (
                    <Pressable
                      key={value}
                      onPress={() => toggleCategory(value as ProductCategory)}
                      className={`rounded-full border px-4 py-2 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {PRODUCT_CATEGORY_LABELS[value as keyof typeof PRODUCT_CATEGORY_LABELS]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Price Range
              </Text>
              <View className="gap-2">
                {PRICE_RANGES.map((range) => {
                  const isSelected = 
                    filters.priceRange.min === range.min && 
                    filters.priceRange.max === range.max;
                  return (
                    <Pressable
                      key={range.label}
                      onPress={() => setPriceRange(range.min, range.max)}
                      className={`rounded-lg border p-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-primary'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {range.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Location/Distance Filter */}
            {showLocationFilter && (
              <View className="mb-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    Distance
                  </Text>
                  {isLocationLoading && (
                    <Text className="text-xs text-gray-500">Getting location...</Text>
                  )}
                  {!location && !isLocationLoading && (
                    <Text className="text-xs text-yellow-600">Location unavailable</Text>
                  )}
                </View>
                <View className="gap-2">
                  {DISTANCE_RANGES.map((range) => {
                    const isSelected = filters.maxDistance === range.value;
                    return (
                      <Pressable
                        key={range.label}
                        onPress={() => setMaxDistance(range.value)}
                        disabled={!location && range.value !== undefined}
                        className={`rounded-lg border p-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 dark:border-gray-600'
                        } ${!location && range.value !== undefined ? 'opacity-50' : ''}`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-primary'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {range.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quick Filters */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Quick Filters
              </Text>
              <View className="gap-3">
                <Pressable
                  onPress={() => toggleFilter('organicOnly')}
                  className="flex-row items-center justify-between rounded-lg border border-gray-300 p-3 dark:border-gray-600"
                >
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organic Only
                  </Text>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded ${
                      filters.organicOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {filters.organicOnly && (
                      <Text className="text-xs font-bold text-white">✓</Text>
                    )}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => toggleFilter('inSeason')}
                  className="flex-row items-center justify-between rounded-lg border border-gray-300 p-3 dark:border-gray-600"
                >
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    In Season Only
                  </Text>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded ${
                      filters.inSeason ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {filters.inSeason && (
                      <Text className="text-xs font-bold text-white">✓</Text>
                    )}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => toggleFilter('inStock')}
                  className="flex-row items-center justify-between rounded-lg border border-gray-300 p-3 dark:border-gray-600"
                >
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    In Stock Only
                  </Text>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded ${
                      filters.inStock ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {filters.inStock && (
                      <Text className="text-xs font-bold text-white">✓</Text>
                    )}
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Sort Options */}
            {showSortOptions && (
              <View className="mb-6">
                <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Sort By
                </Text>
                <View className="gap-2">
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = 
                      filters.sortBy === option.value && 
                      filters.sortOrder === option.order;
                    return (
                      <Pressable
                        key={`${option.value}-${option.order}`}
                        onPress={() => setSort(option.value as ProductFilterOptions['sortBy'], option.order)}
                        disabled={option.value === 'distance' && !location}
                        className={`rounded-lg border p-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 dark:border-gray-600'
                        } ${option.value === 'distance' && !location ? 'opacity-50' : ''}`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-primary'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <Button
              label="Reset"
              onPress={handleReset}
              variant="outline"
              className="flex-1"
            />
            <Button
              label={`Apply${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
              onPress={handleApply}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

