import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react-native';

import { Button, Text, View } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { SortOptionsModal, type SortOption, type SortSelection } from './sort-options-modal';

export type SearchResultsScreenProps<T> = {
  // Data
  data: T[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  showFilters?: boolean;
  onFilterPress?: () => void;
  activeFilterCount?: number;
  
  // Sort
  sortOptions: SortOption[];
  currentSort: SortSelection;
  onSortChange: (sort: SortSelection) => void;
  
  // Rendering
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  
  // Empty states
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onPress: () => void;
  };
  
  // Actions
  onRefresh?: () => void;
  onLoadMore?: () => void;
  
  // UI
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  className?: string;
};

export function SearchResultsScreen<T>({
  data,
  isLoading = false,
  isRefreshing = false,
  error = null,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showFilters = true,
  onFilterPress,
  activeFilterCount = 0,
  sortOptions,
  currentSort,
  onSortChange,
  renderItem,
  keyExtractor,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters',
  emptyAction,
  onRefresh,
  onLoadMore,
  title,
  subtitle,
  headerRight,
  className = '',
}: SearchResultsScreenProps<T>) {
  const [showSortModal, setShowSortModal] = useState(false);

  // Get current sort label
  const currentSortLabel = useMemo(() => {
    const option = sortOptions.find(
      opt => opt.value === currentSort.sortBy && opt.order === currentSort.sortOrder
    );
    return option?.label || 'Sort';
  }, [sortOptions, currentSort]);

  // Handle sort apply
  const handleSortApply = useCallback((sort: SortSelection) => {
    onSortChange(sort);
  }, [onSortChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  // Render header
  const renderHeader = () => (
    <View className="bg-white dark:bg-gray-800">
      <View className="px-4 pt-4">
        {/* Title Section */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </Text>
            {subtitle && (
              <Text className="mt-1 text-gray-600 dark:text-gray-400">
                {subtitle}
              </Text>
            )}
          </View>
          {headerRight}
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <View className="relative">
            <Input
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              className="pr-10"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter and Sort Bar */}
        <View className="mb-4 flex-row items-center gap-2">
          {showFilters && onFilterPress && (
            <Button
              onPress={onFilterPress}
              variant="outline"
              size="sm"
              className="flex-1 flex-row items-center justify-center"
            >
              <Filter size={16} className="text-gray-700 dark:text-gray-300" />
              <Text className="ml-2 text-gray-700 dark:text-gray-300">
                Filters
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Text>
            </Button>
          )}
          
          <Button
            onPress={() => setShowSortModal(true)}
            variant="outline"
            size="sm"
            className="flex-1 flex-row items-center justify-center"
          >
            <ArrowUpDown size={16} className="text-gray-700 dark:text-gray-300" />
            <Text className="ml-2 text-gray-700 dark:text-gray-300" numberOfLines={1}>
              {currentSortLabel}
            </Text>
          </Button>
        </View>

        {/* Results Count */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${data.length} result${data.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="mt-4 text-gray-600 dark:text-gray-400">
        Searching...
      </Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
        Something went wrong
      </Text>
      <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
        {error || 'Please try again'}
      </Text>
      {onRefresh && (
        <Button
          label="Try Again"
          onPress={onRefresh}
          variant="outline"
        />
      )}
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Search size={40} className="text-gray-400" />
      </View>
      <Text className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
        {emptyTitle}
      </Text>
      <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
        {emptyDescription}
      </Text>
      {emptyAction && (
        <Button
          label={emptyAction.label}
          onPress={emptyAction.onPress}
          variant="outline"
        />
      )}
    </View>
  );

  // Render results
  const renderResults = () => (
    <View className="flex-1">
      {data.map((item, index) => (
        <View key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </View>
      ))}
    </View>
  );

  return (
    <View className={`flex-1 bg-gray-50 dark:bg-gray-900 ${className}`}>
      {renderHeader()}
      
      <ScrollView
        className="flex-1"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = 
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && onLoadMore && !isLoading) {
            onLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {isLoading && data.length === 0 ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : data.length === 0 ? (
          renderEmpty()
        ) : (
          renderResults()
        )}
      </ScrollView>

      {/* Sort Modal */}
      <SortOptionsModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onApply={handleSortApply}
        options={sortOptions}
        initialSelection={currentSort}
      />
    </View>
  );
}

