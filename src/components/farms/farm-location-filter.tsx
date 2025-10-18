import React, { useState, useCallback } from 'react';
import { Modal, ScrollView, Pressable } from 'react-native';
import { X, MapPin, Navigation } from 'lucide-react-native';

import { Button, Text, View } from '@/components/ui';
import { useLocation } from '@/lib/hooks/use-location';

export type FarmLocationFilterOptions = {
  maxDistance: number; // in km
  useCurrentLocation: boolean;
  customLocation?: {
    latitude: number;
    longitude: number;
  };
};

type FarmLocationFilterProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FarmLocationFilterOptions) => void;
  initialFilters?: Partial<FarmLocationFilterOptions>;
};

const DEFAULT_FILTERS: FarmLocationFilterOptions = {
  maxDistance: 100,
  useCurrentLocation: true,
};

// Distance presets
const DISTANCE_PRESETS = [
  { label: 'Within 5 km', value: 5, icon: '🚶', description: 'Very close by' },
  { label: 'Within 10 km', value: 10, icon: '🚴', description: 'Nearby' },
  { label: 'Within 25 km', value: 25, icon: '🚗', description: 'Short drive' },
  { label: 'Within 50 km', value: 50, icon: '🚙', description: 'Medium distance' },
  { label: 'Within 100 km', value: 100, icon: '🚚', description: 'Extended area' },
  { label: 'Within 200 km', value: 200, icon: '✈️', description: 'Wide area' },
];

export function FarmLocationFilter({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FarmLocationFilterProps) {
  const [filters, setFilters] = useState<FarmLocationFilterOptions>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const { 
    coordinates: location, 
    isLoading: isLocationLoading,
    error: locationError,
    requestPermission,
  } = useLocation();

  // Distance selection
  const setMaxDistance = useCallback((distance: number) => {
    setFilters(prev => ({
      ...prev,
      maxDistance: distance,
    }));
  }, []);

  // Toggle current location
  const toggleCurrentLocation = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      useCurrentLocation: !prev.useCurrentLocation,
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

  // Request location permission
  const handleRequestLocation = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setFilters(prev => ({
        ...prev,
        useCurrentLocation: true,
      }));
    }
  }, [requestPermission]);

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
              <MapPin size={24} className="text-primary" />
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Location Filter
              </Text>
            </View>
            
            <Pressable onPress={onClose} className="p-2">
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Location Status */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Your Location
              </Text>
              
              {isLocationLoading && (
                <View className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <Text className="text-sm text-blue-800 dark:text-blue-200">
                    📍 Getting your location...
                  </Text>
                </View>
              )}
              
              {!isLocationLoading && location && (
                <View className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Navigation size={16} className="text-green-600 dark:text-green-400" />
                    <Text className="font-medium text-green-800 dark:text-green-200">
                      Location Enabled
                    </Text>
                  </View>
                  <Text className="text-sm text-green-700 dark:text-green-300">
                    Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
              
              {!isLocationLoading && !location && (
                <View className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <Text className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                    Location Not Available
                  </Text>
                  <Text className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
                    Enable location access to find farms near you.
                  </Text>
                  <Button
                    label="Enable Location"
                    onPress={handleRequestLocation}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}

              {locationError && (
                <View className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <Text className="text-sm text-red-800 dark:text-red-200">
                    {locationError}
                  </Text>
                </View>
              )}
            </View>

            {/* Use Current Location Toggle */}
            <View className="mb-6">
              <Pressable
                onPress={toggleCurrentLocation}
                disabled={!location}
                className={`flex-row items-center justify-between rounded-lg border p-4 ${
                  !location ? 'opacity-50' : ''
                } ${
                  filters.useCurrentLocation
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <View className="flex-1">
                  <Text className="font-medium text-gray-900 dark:text-white">
                    Use My Current Location
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Find farms near where you are now
                  </Text>
                </View>
                <View
                  className={`h-6 w-6 items-center justify-center rounded ${
                    filters.useCurrentLocation ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {filters.useCurrentLocation && (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Distance Selection */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Maximum Distance
              </Text>
              <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Show farms within this distance from your location
              </Text>
              <View className="gap-3">
                {DISTANCE_PRESETS.map((preset) => {
                  const isSelected = filters.maxDistance === preset.value;
                  return (
                    <Pressable
                      key={preset.value}
                      onPress={() => setMaxDistance(preset.value)}
                      className={`rounded-lg border p-4 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center gap-3">
                          <Text className="text-2xl">{preset.icon}</Text>
                          <View className="flex-1">
                            <Text
                              className={`font-medium ${
                                isSelected
                                  ? 'text-primary'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {preset.label}
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                              {preset.description}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Text className="text-xs font-bold text-white">✓</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Info Box */}
            <View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <Text className="mb-1 font-medium text-blue-900 dark:text-blue-100">
                💡 Tip
              </Text>
              <Text className="text-sm text-blue-800 dark:text-blue-200">
                Farms will be sorted by distance from your location. The closer the farm, the fresher the produce and lower the delivery costs!
              </Text>
            </View>
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
              label="Apply Filter"
              onPress={handleApply}
              className="flex-1"
              disabled={filters.useCurrentLocation && !location}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

