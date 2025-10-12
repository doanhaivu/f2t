import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react-native';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text as UIText, View } from '@/components/ui';

// Search types
export type SearchFilter = {
  query: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  sortBy?: 'relevance' | 'price' | 'distance' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
  organic?: boolean;
  farmId?: string;
};

export type SearchResult<T> = {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  filters: SearchFilter;
};

export type SearchBarProps<T> = {
  // Data
  data: T[];
  searchFields: (keyof T)[];
  
  // Configuration
  placeholder?: string;
  debounceMs?: number;
  minQueryLength?: number;
  showFilters?: boolean;
  showSort?: boolean;
  
  // Callbacks
  onSearch: (filter: SearchFilter) => void;
  onFilterPress?: () => void;
  onSortPress?: () => void;
  onClear?: () => void;
  
  // State
  loading?: boolean;
  error?: string | null;
  
  // Custom renderers
  renderResult?: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
  
  // Styling
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

// Search utility functions
const searchInFields = <T,>(
  item: T,
  query: string,
  fields: (keyof T)[]
): boolean => {
  if (!query.trim()) return true;
  
  const searchQuery = query.toLowerCase();
  
  return fields.some(field => {
    const value = item[field];
    if (value === null || value === undefined) return false;
    
    const stringValue = String(value).toLowerCase();
    return stringValue.includes(searchQuery);
  });
};

const filterByCategory = <T,>(
  item: T,
  category: string | undefined,
  categoryField: keyof T
): boolean => {
  if (!category) return true;
  return item[categoryField] === category;
};

const filterByPriceRange = <T,>(
  item: T,
  priceRange: { min: number; max: number } | undefined,
  priceField: keyof T
): boolean => {
  if (!priceRange) return true;
  
  const price = Number(item[priceField]);
  if (isNaN(price)) return false;
  
  return price >= priceRange.min && price <= priceRange.max;
};

const filterByStock = <T,>(
  item: T,
  inStock: boolean | undefined,
  stockField: keyof T
): boolean => {
  if (inStock === undefined) return true;
  
  const stock = Number(item[stockField]);
  if (isNaN(stock)) return !inStock;
  
  return inStock ? stock > 0 : stock === 0;
};

const filterByOrganic = <T,>(
  item: T,
  organic: boolean | undefined,
  organicField: keyof T
): boolean => {
  if (organic === undefined) return true;
  return Boolean(item[organicField]) === organic;
};

const sortItems = <T,>(
  items: T[],
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' = 'asc',
  sortField?: keyof T
): T[] => {
  if (!sortBy || !sortField) return items;
  
  return [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Main SearchBar component
export function SearchBar<T>({
  data,
  searchFields,
  placeholder = 'Search...',
  debounceMs = 300,
  minQueryLength = 1,
  showFilters = true,
  showSort = true,
  onSearch,
  onFilterPress,
  onSortPress,
  onClear,
  loading = false,
  error = null,
  renderResult,
  renderEmpty,
  renderError,
  className = '',
  inputClassName = '',
  buttonClassName = '',
}: SearchBarProps<T>) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({
    query: '',
  });
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= minQueryLength || query.length === 0) {
        const newFilters = { ...filters, query };
        setFilters(newFilters);
        onSearch(newFilters);
        setIsSearching(false);
      }
    }, debounceMs);

    if (query.length > 0) {
      setIsSearching(true);
    }

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, minQueryLength, filters, onSearch]);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  // Handle clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setFilters({ query: '' });
    onClear?.();
  }, [onClear]);

  // Handle filter press
  const handleFilterPress = useCallback(() => {
    onFilterPress?.();
  }, [onFilterPress]);

  // Handle sort press
  const handleSortPress = useCallback(() => {
    onSortPress?.();
  }, [onSortPress]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = data;

    // Apply text search
    if (query.length >= minQueryLength) {
      result = result.filter(item => searchInFields(item, query, searchFields));
    }

    // Apply filters
    if (filters.category) {
      result = result.filter(item => filterByCategory(item, filters.category, 'category' as keyof T));
    }

    if (filters.priceRange) {
      result = result.filter(item => filterByPriceRange(item, filters.priceRange, 'pricePerUnit' as keyof T));
    }

    if (filters.inStock !== undefined) {
      result = result.filter(item => filterByStock(item, filters.inStock, 'availableQuantity' as keyof T));
    }

    if (filters.organic !== undefined) {
      result = result.filter(item => filterByOrganic(item, filters.organic, 'isOrganic' as keyof T));
    }

    // Apply sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy === 'price' ? 'pricePerUnit' as keyof T :
                       filters.sortBy === 'name' ? 'name' as keyof T :
                       filters.sortBy === 'rating' ? 'rating' as keyof T :
                       undefined;
      
      if (sortField) {
        result = sortItems(result, filters.sortBy, filters.sortOrder, sortField);
      }
    }

    return result;
  }, [data, query, filters, searchFields, minQueryLength]);

  // Render loading state
  const renderLoading = () => (
    <View className="flex-row items-center justify-center py-4">
      <ActivityIndicator size="small" className="mr-2" />
      <UIText className="text-gray-600 dark:text-gray-400">Searching...</UIText>
    </View>
  );

  // Render error state
  const renderErrorState = () => {
    if (error && renderError) {
      return renderError(error);
    }
    
    if (error) {
      return (
        <View className="flex-row items-center justify-center py-4">
          <UIText className="text-red-600 dark:text-red-400">{error}</UIText>
        </View>
      );
    }
    
    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (renderEmpty) {
      return renderEmpty();
    }
    
    return (
      <View className="flex-row items-center justify-center py-8">
        <UIText className="text-gray-500 dark:text-gray-400">
          {query ? 'No results found' : 'Start typing to search...'}
        </UIText>
      </View>
    );
  };

  return (
    <View className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <View className="flex-row items-center space-x-2">
        <View className="flex-1 relative">
          <Input
            value={query}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            className={`pr-10 ${inputClassName}`}
          />
          {isSearching && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>

        {/* Filter Button */}
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleFilterPress}
            className={`px-3 ${buttonClassName}`}
          >
            <Filter size={16} className="mr-1" />
            <UIText className="text-sm">Filter</UIText>
          </Button>
        )}

        {/* Sort Button */}
        {showSort && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleSortPress}
            className={`px-3 ${buttonClassName}`}
          >
            {filters.sortOrder === 'desc' ? (
              <SortDesc size={16} className="mr-1" />
            ) : (
              <SortAsc size={16} className="mr-1" />
            )}
            <UIText className="text-sm">Sort</UIText>
          </Button>
        )}
      </View>

      {/* Search Results */}
      <View className="flex-1">
        {loading ? (
          renderLoading()
        ) : error ? (
          renderErrorState()
        ) : filteredData.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="space-y-2">
            {filteredData.map((item, index) => (
              <View key={index}>
                {renderResult ? renderResult(item, index) : (
                  <UIText>{String(item)}</UIText>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Search Stats */}
      {query && filteredData.length > 0 && (
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <UIText className="text-sm text-gray-600 dark:text-gray-400">
            {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} found
          </UIText>
          {filters.sortBy && (
            <UIText className="text-sm text-gray-500 dark:text-gray-500">
              Sorted by {filters.sortBy} ({filters.sortOrder})
            </UIText>
          )}
        </View>
      )}
    </View>
  );
}