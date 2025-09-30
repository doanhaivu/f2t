import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Button,
  ControlledInput,
  Text,
  View,
} from '@/components/ui';
import { 
  useVerifyEmail, 
  useSendEmailVerification,
  updateVerificationStatus,
} from '@/api/auth';

const emailVerificationSchema = z.object({
  verificationCode: z
    .string({
      required_error: 'Verification code is required',
    })
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

export type EmailVerificationFormType = z.infer<typeof emailVerificationSchema>;

export type EmailVerificationProps = {
  email: string;
  onVerificationComplete?: (verified: boolean) => void;
  onSkip?: () => void;
  allowSkip?: boolean;
};

export const EmailVerification = ({
  email,
  onVerificationComplete = () => {},
  onSkip = () => {},
  allowSkip = false,
}: EmailVerificationProps) => {
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);

  const { handleSubmit, control, setError, clearErrors } = useForm<EmailVerificationFormType>({
    resolver: zodResolver(emailVerificationSchema),
  });

  const verifyEmailMutation = useVerifyEmail();
  const sendVerificationMutation = useSendEmailVerification();

  // Countdown timer for resend button
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerification = async () => {
    try {
      clearErrors();
      await sendVerificationMutation.mutateAsync({ email });
      setVerificationSent(true);
      setCountdown(60); // 60 seconds countdown
      setCanResend(false);
    } catch (error) {
      console.error('Failed to send verification:', error);
      // Handle error - could show toast or error message
    }
  };

  const handleVerifyCode: SubmitHandler<EmailVerificationFormType> = async (data) => {
    try {
      clearErrors();
      const response = await verifyEmailMutation.mutateAsync({
        email,
        verificationCode: data.verificationCode,
      });

      if (response.success && response.verified) {
        // Update user verification status
        await updateVerificationStatus('email', true);
        onVerificationComplete(true);
      } else {
        setError('verificationCode', {
          type: 'manual',
          message: response.message || 'Invalid verification code',
        });
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      setError('verificationCode', {
        type: 'manual',
        message: 'Verification failed. Please try again.',
      });
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    
    const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  // Auto-send verification on component mount if not already sent
  useEffect(() => {
    if (!verificationSent && email) {
      handleSendVerification();
    }
  }, [email, verificationSent]);

  return (
    <View className="flex-1 justify-center p-6">
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-center mb-2">
          Email Verification
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mb-4">
          We've sent a 6-digit verification code to
        </Text>
        <Text className="text-center text-lg font-semibold text-blue-600 dark:text-blue-400 mb-6">
          {maskEmail(email)}
        </Text>
        <Text className="text-center text-sm text-gray-500 max-w-sm">
          Check your email and enter the code below
        </Text>
      </View>

      <View className="mb-6">
        <ControlledInput
          control={control}
          name="verificationCode"
          label="Verification Code"
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          autoCapitalize="none"
          className="text-center text-2xl tracking-widest"
        />
      </View>

      <Button
        label={verifyEmailMutation.isPending ? "Verifying..." : "Verify Email Address"}
        onPress={handleSubmit(handleVerifyCode)}
        disabled={verifyEmailMutation.isPending}
        className="mb-4"
      />

      {/* Resend verification code */}
      <View className="items-center mb-6">
        <Text className="text-sm text-gray-500 mb-2">
          Didn't receive the code?
        </Text>
        <Button
          label={
            !canResend 
              ? `Resend in ${countdown}s` 
              : sendVerificationMutation.isPending 
                ? "Sending..." 
                : "Resend Code"
          }
          onPress={handleSendVerification}
          disabled={!canResend || sendVerificationMutation.isPending}
          variant="outline"
          className="mb-2"
        />
        <Text className="text-xs text-gray-400 text-center mt-2">
          Check your spam folder if you don't see the email
        </Text>
      </View>

      {/* Skip option (if allowed) */}
      {allowSkip && (
        <View className="items-center">
          <Button
            label="Skip for Now"
            onPress={onSkip}
            variant="ghost"
            className="text-gray-500"
          />
          <Text className="text-xs text-gray-400 text-center mt-2 max-w-xs">
            You can verify your email later in settings
          </Text>
        </View>
      )}

      {/* Loading indicator */}
      {(verifyEmailMutation.isPending || sendVerificationMutation.isPending) && (
        <View className="items-center mt-4">
          <Text className="text-sm text-gray-500">
            {verifyEmailMutation.isPending ? 'Verifying code...' : 'Sending verification code...'}
          </Text>
        </View>
      )}
    </View>
  );
};
