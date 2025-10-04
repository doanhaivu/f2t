import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { View, Text, Input, Button, Select, Checkbox } from '@/components/ui';
import { LocationPicker } from './location-picker';
import { BusinessHoursPicker } from './business-hours-picker';
import { DeliveryZoneManager } from './delivery-zone-manager';
import { useUpdateFarm } from '@/api/farms';
import type { Farm, DeliveryMethod, BusinessHours, DeliveryZone, FarmLocation } from '@/types';

// Form validation schema
const farmProfileSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number'),
  deliveryMethods: z.array(z.enum(['pickup', 'farm_delivery', 'both'])).min(1, 'Select at least one delivery method'),
  location: z.object({
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'ZIP code is required'),
      country: z.string().min(1, 'Country is required'),
    }),
    farmingArea: z.number().min(0.1, 'Farming area must be greater than 0'),
  }),
  businessHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    }),
  }),
  isActive: z.boolean(),
});

type FarmProfileFormData = z.infer<typeof farmProfileSchema>;

export type FarmProfileEditFormProps = {
  farm: Farm;
  onSuccess?: (updatedFarm: Farm) => void;
  onCancel?: () => void;
};

export const FarmProfileEditForm = ({
  farm,
  onSuccess,
  onCancel,
}: FarmProfileEditFormProps) => {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(farm.deliveryZones || []);
  const updateFarmMutation = useUpdateFarm();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FarmProfileFormData>({
    resolver: zodResolver(farmProfileSchema),
    defaultValues: {
      name: farm.name,
      description: farm.description,
      contactEmail: farm.contactEmail,
      contactPhone: farm.contactPhone,
      deliveryMethods: farm.deliveryMethods,
      location: farm.location,
      businessHours: farm.businessHours,
      isActive: farm.isActive,
    },
  });

  const deliveryMethods = watch('deliveryMethods');
  const location = watch('location');

  const deliveryMethodOptions = [
    { label: 'Farm Pickup Only', value: 'pickup' },
    { label: 'Farm Delivery Only', value: 'farm_delivery' },
    { label: 'Both Pickup & Delivery', value: 'both' },
  ];

  const handleLocationChange = (newLocation: FarmLocation) => {
    setValue('location', newLocation, { shouldValidate: true });
  };

  const handleBusinessHoursChange = (newBusinessHours: BusinessHours) => {
    setValue('businessHours', newBusinessHours, { shouldValidate: true });
  };

  const handleDeliveryZonesChange = (zones: DeliveryZone[]) => {
    setDeliveryZones(zones);
  };

  const onSubmit = async (data: FarmProfileFormData) => {
    try {
      // Transform business hours to match API format
      const transformedBusinessHours = Object.entries(data.businessHours).reduce(
        (acc, [day, schedule]) => ({
          ...acc,
          [day]: {
            open: schedule.openTime,
            close: schedule.closeTime,
            isOpen: schedule.isOpen,
          },
        }),
        {}
      );

      const updateData = {
        ...data,
        businessHours: transformedBusinessHours,
        deliveryZones,
      };

      await updateFarmMutation.mutateAsync({
        id: farm.id,
        ...updateData,
      });

      Alert.alert(
        'Success',
        'Farm profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => onSuccess?.(farm),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to update farm profile:', error);
      Alert.alert(
        'Error',
        'Failed to update farm profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Edit Farm Profile
        </Text>

        {/* Basic Information */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Farm Name"
                placeholder="Enter your farm name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description"
                placeholder="Tell customers about your farm..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={4}
                className="mb-4"
              />
            )}
          />
        </View>

        {/* Contact Information */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </Text>

          <Controller
            control={control}
            name="contactEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                placeholder="farm@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.contactEmail?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="contactPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.contactPhone?.message}
                keyboardType="phone-pad"
                className="mb-4"
              />
            )}
          />
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Farm Location
          </Text>
          
          <LocationPicker
            location={location}
            onLocationChange={handleLocationChange}
            error={errors.location?.message}
          />
        </View>

        {/* Delivery Methods */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Delivery Methods
          </Text>

          <Controller
            control={control}
            name="deliveryMethods"
            render={({ field: { onChange, value } }) => (
              <Select
                options={deliveryMethodOptions}
                value={value[0] || ''}
                onSelect={(selectedValue) => {
                  onChange([selectedValue as DeliveryMethod]);
                }}
                placeholder="Select delivery method"
                error={errors.deliveryMethods?.message}
              />
            )}
          />
        </View>

        {/* Delivery Zones (only if delivery is enabled) */}
        {deliveryMethods.includes('farm_delivery') || deliveryMethods.includes('both') ? (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delivery Zones
            </Text>
            
            <DeliveryZoneManager
              zones={deliveryZones}
              farmLocation={location}
              onZonesChange={handleDeliveryZonesChange}
            />
          </View>
        ) : null}

        {/* Business Hours */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Business Hours
          </Text>

          <Controller
            control={control}
            name="businessHours"
            render={({ field: { value } }) => (
              <BusinessHoursPicker
                businessHours={value}
                onBusinessHoursChange={handleBusinessHoursChange}
                error={errors.businessHours?.message}
              />
            )}
          />
        </View>

        {/* Farm Status */}
        <View className="mb-8">
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <Checkbox
                label="Farm is active and accepting orders"
                checked={value}
                onChange={onChange}
                accessibilityLabel="Toggle farm active status"
              />
            )}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-4">
          <Button
            label="Cancel"
            onPress={handleCancel}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          />
          
          <Button
            label={isSubmitting ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit(onSubmit)}
            className="flex-1"
            disabled={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
};
