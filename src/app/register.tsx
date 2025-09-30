import { useRouter } from 'expo-router';
import React from 'react';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';

export default function RegisterChoiceScreen() {
  const router = useRouter();

  const handleConsumerRegistration = () => {
    // Navigate to consumer registration (we'll use login form for now)
    router.push('/login');
  };

  const handleFarmRegistration = () => {
    router.push('/farms/register');
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="px-6 pt-12 pb-8">
          <Button
            label="← Back to Login"
            onPress={handleBackToLogin}
            variant="ghost"
            className="mb-6 self-start"
          />
          
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Marketplace
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-base leading-6">
            Choose how you'd like to participate in our fresh produce marketplace
          </Text>
        </View>

        {/* Registration Options */}
        <View className="flex-1 px-6">
          {/* Consumer Registration */}
          <View className="mb-6 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <View className="mb-4">
              <Text className="text-2xl mb-2">🛒</Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                I'm a Customer
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                Browse and purchase fresh produce from local farms. Enjoy farm-to-table quality delivered to your door.
              </Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What you get:
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Access to fresh, local produce
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Direct connection with local farms
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Convenient delivery options
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                • Support for sustainable farming
              </Text>
            </View>

            <Button
              label="Register as Customer"
              onPress={handleConsumerRegistration}
              variant="outline"
              className="w-full"
            />
          </View>

          {/* Farm Registration */}
          <View className="mb-6 p-6 border-2 border-green-200 dark:border-green-700 rounded-2xl bg-green-50 dark:bg-green-900/20">
            <View className="mb-4">
              <Text className="text-2xl mb-2">🚜</Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                I'm a Farm/Producer
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                Sell your fresh produce directly to local customers. Grow your business with our marketplace platform.
              </Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What you get:
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Direct access to local customers
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Product management tools
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                • Order tracking and analytics
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                • Competitive commission rates
              </Text>
            </View>

            <Button
              label="Register as Farm"
              onPress={handleFarmRegistration}
              className="w-full bg-green-600 dark:bg-green-600"
            />
          </View>
        </View>

        {/* Already have account */}
        <View className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 dark:text-gray-400 mr-2">
              Already have an account?
            </Text>
            <Button
              label="Sign In"
              onPress={handleBackToLogin}
              variant="ghost"
              className="p-0"
            />
          </View>
        </View>
      </View>
    </>
  );
}
