import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { FarmRegistrationForm } from '@/components/farm-registration-form';
import type { FarmRegistrationFormType } from '@/components/farm-registration-form';
import { transformFormDataToApiRequest } from '@/components/farm-registration-form-utils';
import { FocusAwareStatusBar, View, Text, Button } from '@/components/ui';
import { useFarmRegister, handleLoginSuccess, needsVerification } from '@/api/auth';

export default function FarmRegisterScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const farmRegisterMutation = useFarmRegister();

  const handleFarmRegistration = async (data: FarmRegistrationFormType) => {
    try {
      setIsSubmitting(true);
      
      // Transform form data to API format
      const apiRequest = transformFormDataToApiRequest(data);
      
      // Register the farm
      const response = await farmRegisterMutation.mutateAsync(apiRequest);
      
      // Handle successful registration with login
      const user = await handleLoginSuccess(response, {
        email: data.email,
        password: data.password,
      });
      
      // Check if user needs verification
      const verification = needsVerification(user);
      if (verification.needsAny) {
        router.replace('/verification');
      } else {
        // Navigate to farm dashboard or main app
        router.replace('/');
      }
    } catch (error) {
      console.error('Farm registration failed:', error);
      // Error is handled by the form component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <View className="flex-row items-center mb-4">
            <Button
              label="← Back"
              onPress={handleBackToLogin}
              variant="ghost"
              className="mr-4"
            />
          </View>
          
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Register Your Farm
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-base">
            Join our marketplace and start selling your fresh produce to local customers
          </Text>
        </View>

        {/* Registration Form */}
        <View className="flex-1">
          <FarmRegistrationForm
            onSubmit={handleFarmRegistration}
            isLoading={isSubmitting || farmRegisterMutation.isPending}
          />
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
