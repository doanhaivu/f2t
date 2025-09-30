import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';

import { PhoneVerification } from './phone-verification';
import { EmailVerification } from './email-verification';
import { View, Text, Button } from '@/components/ui';
import { needsVerification } from '@/api/auth';
import { useAuth } from '@/lib';

export type VerificationFlowProps = {
  onComplete?: () => void;
  allowSkip?: boolean;
  skipRoute?: string;
};

type VerificationStep = 'phone' | 'email' | 'complete';

export const VerificationFlow = ({ 
  onComplete, 
  allowSkip = true,
  skipRoute = '/' 
}: VerificationFlowProps) => {
  const router = useRouter();
  const user = useAuth.use.user();
  const [currentStep, setCurrentStep] = useState<VerificationStep>(() => {
    if (!user) return 'phone';
    
    const verification = needsVerification(user);
    if (verification.needsPhone) return 'phone';
    if (verification.needsEmail) return 'email';
    return 'complete';
  });

  const handlePhoneVerificationComplete = useCallback((verified: boolean) => {
    if (verified) {
      const updatedUser = useAuth.getState().user;
      if (updatedUser && !updatedUser.emailVerified) {
        setCurrentStep('email');
      } else {
        setCurrentStep('complete');
      }
    }
  }, []);

  const handleEmailVerificationComplete = useCallback((verified: boolean) => {
    if (verified) {
      setCurrentStep('complete');
    }
  }, []);

  const handleSkipVerification = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.replace(skipRoute as any);
    }
  }, [onComplete, router, skipRoute]);

  const handleContinue = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/');
    }
  }, [onComplete, router]);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg text-gray-500">
          Please log in to continue
        </Text>
      </View>
    );
  }

  if (currentStep === 'complete') {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="items-center mb-8">
          <Text className="text-4xl mb-4">🎉</Text>
          <Text className="text-3xl font-bold text-center mb-4">
            Verification Complete!
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
            Your account has been successfully verified. You're all set to start using the marketplace!
          </Text>
        </View>

        <Button
          label="Continue to App"
          onPress={handleContinue}
          className="w-full"
        />
      </View>
    );
  }

  if (currentStep === 'phone') {
    return (
      <PhoneVerification
        phoneNumber={user.phoneNumber}
        onVerificationComplete={handlePhoneVerificationComplete}
        onSkip={() => {
          const updatedUser = useAuth.getState().user;
          if (updatedUser && !updatedUser.emailVerified) {
            setCurrentStep('email');
          } else {
            handleSkipVerification();
          }
        }}
        allowSkip={allowSkip}
      />
    );
  }

  if (currentStep === 'email') {
    return (
      <EmailVerification
        email={user.email}
        onVerificationComplete={handleEmailVerificationComplete}
        onSkip={handleSkipVerification}
        allowSkip={allowSkip}
      />
    );
  }

  return null;
};
