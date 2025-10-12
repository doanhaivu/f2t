import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Text, View, Input, Select, Checkbox } from '@/components/ui';
import type { CheckoutFormData } from './types';

// Form validation schema
const checkoutSchema = z.object({
  // Customer information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  
  // Billing address
  billingAddress: z.object({
    addressLine1: z.string().min(1, 'Billing address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'Billing city is required'),
    state: z.string().min(1, 'Billing state is required'),
    postalCode: z.string().min(1, 'Billing postal code is required'),
    country: z.string().min(1, 'Billing country is required'),
    phoneNumber: z.string().optional(),
  }),
  
  // Shipping address
  shippingAddress: z.object({
    addressLine1: z.string().min(1, 'Shipping address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'Shipping city is required'),
    state: z.string().min(1, 'Shipping state is required'),
    postalCode: z.string().min(1, 'Shipping postal code is required'),
    country: z.string().min(1, 'Shipping country is required'),
    phoneNumber: z.string().optional(),
  }),
  
  // Delivery preferences
  deliveryMethod: z.enum(['pickup', 'delivery']),
  deliveryDate: z.string().optional(),
  deliveryTimeSlot: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  
  // Payment information
  paymentMethod: z.enum(['cash_on_delivery', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet']),
  
  // Additional information
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  discountCode: z.string().optional(),
});

// Payment method options
const paymentMethodOptions = [
  { label: 'Cash on Delivery', value: 'cash_on_delivery' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
];

// Delivery method options
const deliveryMethodOptions = [
  { label: 'Home Delivery', value: 'delivery' },
  { label: 'Farm Pickup', value: 'pickup' },
];

// Time slot options
const timeSlotOptions = [
  { label: 'Morning (9:00 AM - 12:00 PM)', value: 'morning' },
  { label: 'Afternoon (12:00 PM - 5:00 PM)', value: 'afternoon' },
  { label: 'Evening (5:00 PM - 8:00 PM)', value: 'evening' },
];

// Country options
const countryOptions = [
  { label: 'United States', value: 'USA' },
  { label: 'Canada', value: 'CAN' },
  { label: 'United Kingdom', value: 'GBR' },
  { label: 'Australia', value: 'AUS' },
];

// State options (US states)
const stateOptions = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

// Props for the checkout form
type CheckoutFormProps = {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading: boolean;
  initialData?: Partial<CheckoutFormData>;
};

// Checkout form component
export const CheckoutForm = ({ 
  onSubmit, 
  isLoading, 
  initialData 
}: CheckoutFormProps) => {
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      billingAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
      },
      shippingAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
      },
      deliveryMethod: 'delivery',
      deliveryDate: '',
      deliveryTimeSlot: '',
      deliveryInstructions: '',
      paymentMethod: 'credit_card',
      notes: '',
      specialInstructions: '',
      discountCode: '',
      ...initialData,
    },
  });

  const watchedDeliveryMethod = watch('deliveryMethod');
  const watchedBillingAddress = watch('billingAddress');

  // Copy billing address to shipping address when checkbox is checked
  useEffect(() => {
    if (useSameAddress) {
      setValue('shippingAddress', watchedBillingAddress);
    }
  }, [useSameAddress, watchedBillingAddress, setValue]);

  // Generate delivery date options (next 7 days)
  const getDeliveryDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push({
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        value: date.toISOString().split('T')[0],
      });
    }
    
    return options;
  };

  const deliveryDateOptions = getDeliveryDateOptions();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4 space-y-6">
        {/* Customer Information */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Information
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="First Name *"
                      placeholder="Enter first name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Last Name *"
                      placeholder="Enter last name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email *"
                  placeholder="Enter email address"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone *"
                  placeholder="Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Billing Address */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Billing Address
          </Text>
          
          <View className="space-y-4">
            <Controller
              control={control}
              name="billingAddress.addressLine1"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Address Line 1 *"
                  placeholder="Enter street address"
                  value={value}
                  onChangeText={onChange}
                  error={errors.billingAddress?.addressLine1?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="billingAddress.addressLine2"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Address Line 2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.billingAddress?.addressLine2?.message}
                />
              )}
            />
            
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="billingAddress.city"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="City *"
                      placeholder="Enter city"
                      value={value}
                      onChangeText={onChange}
                      error={errors.billingAddress?.city?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="billingAddress.state"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="State *"
                      placeholder="Select state"
                      value={value}
                      onSelect={onChange}
                      options={stateOptions}
                      error={errors.billingAddress?.state?.message}
                    />
                  )}
                />
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="billingAddress.postalCode"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Postal Code *"
                      placeholder="Enter postal code"
                      value={value}
                      onChangeText={onChange}
                      error={errors.billingAddress?.postalCode?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="billingAddress.country"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Country *"
                      placeholder="Select country"
                      value={value}
                      onSelect={onChange}
                      options={countryOptions}
                      error={errors.billingAddress?.country?.message}
                    />
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Shipping Address
            </Text>
            <Checkbox
              label="Same as billing address"
              checked={useSameAddress}
              onChange={setUseSameAddress}
              accessibilityLabel="Use billing address for shipping"
            />
          </View>
          
          {!useSameAddress && (
            <View className="space-y-4">
              <Controller
                control={control}
                name="shippingAddress.addressLine1"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Address Line 1 *"
                    placeholder="Enter street address"
                    value={value}
                    onChangeText={onChange}
                    error={errors.shippingAddress?.addressLine1?.message}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="shippingAddress.addressLine2"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Address Line 2"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={value}
                    onChangeText={onChange}
                    error={errors.shippingAddress?.addressLine2?.message}
                  />
                )}
              />
              
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="shippingAddress.city"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="City *"
                        placeholder="Enter city"
                        value={value}
                        onChangeText={onChange}
                        error={errors.shippingAddress?.city?.message}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="shippingAddress.state"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="State *"
                        placeholder="Select state"
                        value={value}
                        onSelect={onChange}
                        options={stateOptions}
                        error={errors.shippingAddress?.state?.message}
                      />
                    )}
                  />
                </View>
              </View>
              
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="shippingAddress.postalCode"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Postal Code *"
                        placeholder="Enter postal code"
                        value={value}
                        onChangeText={onChange}
                        error={errors.shippingAddress?.postalCode?.message}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="shippingAddress.country"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Country *"
                        placeholder="Select country"
                        value={value}
                        onSelect={onChange}
                        options={countryOptions}
                        error={errors.shippingAddress?.country?.message}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Delivery Options */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Options
          </Text>
          
          <View className="space-y-4">
            <Controller
              control={control}
              name="deliveryMethod"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Delivery Method"
                  placeholder="Select delivery method"
                  value={value}
                  onSelect={onChange}
                  options={deliveryMethodOptions}
                  error={errors.deliveryMethod?.message}
                />
              )}
            />
            
            {watchedDeliveryMethod === 'delivery' && (
              <>
                <Controller
                  control={control}
                  name="deliveryDate"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Delivery Date"
                      placeholder="Select delivery date"
                      value={value}
                      onSelect={onChange}
                      options={deliveryDateOptions}
                      error={errors.deliveryDate?.message}
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="deliveryTimeSlot"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Delivery Time Slot"
                      placeholder="Select time slot"
                      value={value}
                      onSelect={onChange}
                      options={timeSlotOptions}
                      error={errors.deliveryTimeSlot?.message}
                    />
                  )}
                />
              </>
            )}
            
            <Controller
              control={control}
              name="deliveryInstructions"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Special Instructions"
                  placeholder="Any special delivery instructions?"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  error={errors.deliveryInstructions?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Payment Information */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Information
          </Text>
          
          <View className="space-y-4">
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Payment Method"
                  placeholder="Select payment method"
                  value={value}
                  onSelect={onChange}
                  options={paymentMethodOptions}
                  error={errors.paymentMethod?.message}
                />
              )}
            />
            
            {watch('paymentMethod') !== 'cash_on_delivery' && (
              <View className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <Text className="text-sm text-blue-800 dark:text-blue-200">
                  Payment will be processed securely at checkout
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Information */}
        <View className="rounded-lg bg-white p-4 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Information
          </Text>
          
          <View className="space-y-4">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Order Notes"
                  placeholder="Any special requests or notes?"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  error={errors.notes?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="discountCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Discount Code"
                  placeholder="Enter discount code (optional)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.discountCode?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Place Order Button */}
        <View className="py-4">
          <Button
            label={isLoading ? "Processing Order..." : "Place Order"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !isValid}
            className="w-full"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckoutForm;
