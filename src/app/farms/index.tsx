import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { View, Text, Button } from '@/components/ui';
import { 
  FarmList, 
  FarmSearch, 
  FarmLocationFilter,
  type FarmSearchFilters,
  type FarmLocationFilterOptions 
} from '@/components/farms';
import { useGetFarms } from '@/api/farms';
import { useAuth } from '@/lib/auth';
import type { Farm } from '@/types';

// Header component
const DiscoveryHeader = ({
  farms,
  searchFilters,
  userLocation,
  locationFilters,
  onOpenLocationFilter,
}: {
  farms: Farm[];
  searchFilters: FarmSearchFilters;
  userLocation: { latitude: number; longitude: number } | null;
  locationFilters: FarmLocationFilterOptions;
  onOpenLocationFilter: () => void;
}) => (
  <View className="bg-white dark:bg-gray-800">
    <View className="p-4 pb-0">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Discover Farms
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Find fresh, local produce near you
          </Text>
        </View>
        
        {userLocation && (
          <Button
            label={`${locationFilters.maxDistance}km`}
            onPress={onOpenLocationFilter}
            variant="outline"
            size="sm"
            className="ml-2"
          />
        )}
      </View>

      {/* Location Status */}
      {userLocation && (
        <View className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-green-800 dark:text-green-200">
                📍 Showing farms within {locationFilters.maxDistance}km
              </Text>
              <Text className="text-xs text-green-700 dark:text-green-300">
                Sorted by distance from your location
              </Text>
            </View>
            <Button
              label="Change"
              onPress={onOpenLocationFilter}
              variant="ghost"
              size="sm"
            />
          </View>
        </View>
      )}

      {/* Stats */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {farms.length} farm{farms.length !== 1 ? 's' : ''} found
        </Text>
        
        {searchFilters.search && (
          <Text className="text-sm text-blue-600 dark:text-blue-400">
            Searching for &quot;{searchFilters.search}&quot;
          </Text>
        )}
      </View>
    </View>
  </View>
);

// Location permission request component
const LocationPermissionRequest = ({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) => (
  <View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
    <Text className="mb-2 font-medium text-blue-900 dark:text-blue-100">
      Enable Location for Better Results
    </Text>
    <Text className="mb-3 text-sm text-blue-800 dark:text-blue-200">
      Allow location access to find farms near you and get distance-based sorting.
    </Text>
    <Button
      label="Enable Location"
      onPress={onRequestPermission}
      variant="outline"
      className="self-start"
    />
  </View>
);

// Loading state component
const LoadingState = () => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <View className="bg-white p-4 dark:bg-gray-800">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Discover Farms
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        Find fresh, local produce near you
      </Text>
    </View>
    
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-600 dark:text-gray-400">
        Loading farms...
      </Text>
    </View>
  </View>
);

// Error state component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <View className="bg-white p-4 dark:bg-gray-800">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Discover Farms
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        Find fresh, local produce near you
      </Text>
    </View>
    
    <View className="flex-1 items-center justify-center p-6">
      <Text className="mb-4 text-center text-xl font-semibold text-gray-900 dark:text-white">
        Unable to Load Farms
      </Text>
      <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
        Please check your connection and try again.
      </Text>
      <Button
        label="Try Again"
        onPress={onRetry}
        variant="outline"
      />
    </View>
  </View>
);

// Hook for location management
const useLocationServices = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.LocationPermissionResponse | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }, []);

  const checkLocationPermission = useCallback(async () => {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      setLocationPermission(permission);
      
      if (permission.granted) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  }, [getCurrentLocation]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(permission);
      
      if (permission.granted) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  return { userLocation, locationPermission, requestLocationPermission };
};

// Hook for farm data and search
const useFarmData = (
  userLocation: { latitude: number; longitude: number } | null,
  locationFilters: FarmLocationFilterOptions
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchFilters, setSearchFilters] = useState<FarmSearchFilters>({
    search: '',
    deliveryMethod: 'all',
    sortBy: userLocation ? 'distance' : 'name',
    sortOrder: 'asc',
    isActive: true,
  });

  // Determine the location to use for filtering
  const filterLocation = locationFilters.useCurrentLocation 
    ? userLocation 
    : locationFilters.customLocation;

  const {
    data: farmsResponse,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFarms({
    variables: {
      limit: 20,
      search: searchFilters.search || undefined,
      deliveryMethod: searchFilters.deliveryMethod !== 'all' ? searchFilters.deliveryMethod : undefined,
      sortBy: searchFilters.sortBy,
      sortOrder: searchFilters.sortOrder,
      isActive: searchFilters.isActive,
      ...(filterLocation && {
        location: {
          latitude: filterLocation.latitude,
          longitude: filterLocation.longitude,
          radius: locationFilters.maxDistance,
        },
      }),
    },
  });

  const farms = farmsResponse?.pages?.flatMap(page => 
    page.success ? page.data?.farms || [] : []
  ) || [];

  return {
    farms,
    searchFilters,
    setSearchFilters,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refreshing,
    setRefreshing,
  };
};

// Hook for search and filter handlers
const useSearchHandlers = ({
  userLocation,
  setSearchFilters,
  refetch,
  setRefreshing,
}: {
  userLocation: { latitude: number; longitude: number } | null;
  setSearchFilters: (filters: FarmSearchFilters) => void;
  refetch: () => void;
  setRefreshing: (refreshing: boolean) => void;
}) => {
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh farms:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, setRefreshing]);

  const handleSearch = useCallback(() => refetch(), [refetch]);

  const handleClearFilters = useCallback(() => {
    setSearchFilters({
      search: '',
      deliveryMethod: 'all',
      sortBy: userLocation ? 'distance' : 'name',
      sortOrder: 'asc',
      isActive: true,
    });
  }, [setSearchFilters, userLocation]);

  const handleFiltersChange = useCallback((newFilters: FarmSearchFilters) => {
    setSearchFilters(newFilters);
  }, [setSearchFilters]);

  return { handleRefresh, handleSearch, handleClearFilters, handleFiltersChange };
};

// Hook for navigation handlers
const useNavigationHandlers = (router: any) => {
  const handleFarmPress = useCallback((farm: Farm) => {
    router.push(`/farms/${farm.id}`);
  }, [router]);

  const handleViewProducts = useCallback((farm: Farm) => {
    router.push(`/farms/${farm.id}/products`);
  }, [router]);

  const handleContactFarm = useCallback((farm: Farm) => {
    console.log('Contact farm:', farm.name);
  }, []);

  return { handleFarmPress, handleViewProducts, handleContactFarm };
};

// Hook for pagination handlers
const usePaginationHandlers = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) => {
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { handleLoadMore };
};

// Main handlers hook
const useFarmHandlers = (params: {
  router: any;
  userLocation: { latitude: number; longitude: number } | null;
  setSearchFilters: (filters: FarmSearchFilters) => void;
  refetch: () => void;
  setRefreshing: (refreshing: boolean) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) => {
  const searchHandlers = useSearchHandlers(params);
  const navigationHandlers = useNavigationHandlers(params.router);
  const paginationHandlers = usePaginationHandlers(params);

  return { ...searchHandlers, ...navigationHandlers, ...paginationHandlers };
};

// Main hook that combines all functionality
const useFarmDiscovery = () => {
  const router = useRouter();
  const { userLocation, locationPermission, requestLocationPermission } = useLocationServices();
  
  // Location filter state
  const [locationFilters, setLocationFilters] = useState<FarmLocationFilterOptions>({
    maxDistance: 100,
    useCurrentLocation: true,
  });
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  
  const {
    farms,
    searchFilters,
    setSearchFilters,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refreshing,
    setRefreshing,
  } = useFarmData(userLocation, locationFilters);

  const handlers = useFarmHandlers({
    router,
    userLocation,
    setSearchFilters,
    refetch,
    setRefreshing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const handleApplyLocationFilter = useCallback((filters: FarmLocationFilterOptions) => {
    setLocationFilters(filters);
    refetch();
  }, [refetch]);

  return {
    farms,
    userLocation,
    locationPermission,
    searchFilters,
    locationFilters,
    showLocationFilter,
    setShowLocationFilter,
    isLoading,
    error,
    refreshing,
    isFetchingNextPage,
    requestLocationPermission,
    refetch,
    handleApplyLocationFilter,
    ...handlers,
  };
};

// Props interface for the main content component
type FarmDiscoveryContentProps = {
  farms: Farm[];
  userLocation: { latitude: number; longitude: number } | null;
  locationPermission: Location.LocationPermissionResponse | null;
  searchFilters: FarmSearchFilters;
  locationFilters: FarmLocationFilterOptions;
  showLocationFilter: boolean;
  setShowLocationFilter: (show: boolean) => void;
  isLoading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  requestLocationPermission: () => void;
  handleRefresh: () => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
  handleFiltersChange: (filters: FarmSearchFilters) => void;
  handleApplyLocationFilter: (filters: FarmLocationFilterOptions) => void;
  handleFarmPress: (farm: Farm) => void;
  handleViewProducts: (farm: Farm) => void;
  handleContactFarm: (farm: Farm) => void;
  handleLoadMore: () => void;
};

// Search section component
const SearchSection = ({
  locationPermission,
  searchFilters,
  userLocation,
  isLoading,
  requestLocationPermission,
  handleFiltersChange,
  handleSearch,
  handleClearFilters,
}: {
  locationPermission: Location.LocationPermissionResponse | null;
  searchFilters: FarmSearchFilters;
  userLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  requestLocationPermission: () => void;
  handleFiltersChange: (filters: FarmSearchFilters) => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
}) => (
  <View className="bg-white p-4 pb-0 dark:bg-gray-800">
    {!locationPermission?.granted && (
      <LocationPermissionRequest onRequestPermission={requestLocationPermission} />
    )}
    <FarmSearch
      filters={searchFilters}
      onFiltersChange={handleFiltersChange}
      onSearch={handleSearch}
      onClear={handleClearFilters}
      showLocationSort={!!userLocation}
      loading={isLoading}
    />
  </View>
);

// Main content component
const FarmDiscoveryContent = (props: FarmDiscoveryContentProps) => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <DiscoveryHeader 
      farms={props.farms}
      searchFilters={props.searchFilters}
      userLocation={props.userLocation}
      locationFilters={props.locationFilters}
      onOpenLocationFilter={() => props.setShowLocationFilter(true)}
    />
    
    <SearchSection
      locationPermission={props.locationPermission}
      searchFilters={props.searchFilters}
      userLocation={props.userLocation}
      isLoading={props.isLoading}
      requestLocationPermission={props.requestLocationPermission}
      handleFiltersChange={props.handleFiltersChange}
      handleSearch={props.handleSearch}
      handleClearFilters={props.handleClearFilters}
    />

    <FarmList
      farms={props.farms}
      loading={props.isLoading}
      refreshing={props.refreshing}
      onRefresh={props.handleRefresh}
      onLoadMore={props.handleLoadMore}
      onFarmPress={props.handleFarmPress}
      onViewProducts={props.handleViewProducts}
      onContactFarm={props.handleContactFarm}
      showDistance={!!props.userLocation}
      userLocation={props.userLocation || undefined}
      variant="default"
      emptyMessage="No farms found"
      emptyDescription={
        props.searchFilters.search
          ? "Try adjusting your search terms or filters"
          : "No farms are available in your area yet"
      }
    />

    {props.isFetchingNextPage && (
      <View className="bg-white p-4 dark:bg-gray-800">
        <Text className="text-center text-gray-600 dark:text-gray-400">
          Loading more farms...
        </Text>
      </View>
    )}

    {/* Location Filter Modal */}
    <FarmLocationFilter
      visible={props.showLocationFilter}
      onClose={() => props.setShowLocationFilter(false)}
      onApply={props.handleApplyLocationFilter}
      initialFilters={props.locationFilters}
    />
  </View>
);

export default function FarmDiscoveryScreen() {
  const discoveryData = useFarmDiscovery();

  if (discoveryData.isLoading && discoveryData.farms.length === 0) {
    return <LoadingState />;
  }

  if (discoveryData.error && discoveryData.farms.length === 0) {
    return <ErrorState onRetry={() => discoveryData.refetch()} />;
  }

  return <FarmDiscoveryContent {...discoveryData} />;
}
