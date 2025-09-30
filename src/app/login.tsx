import { useRouter } from 'expo-router';
import React from 'react';

import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useLogin, handleLoginSuccess, needsVerification } from '@/api';

export default function Login() {
  const router = useRouter();
  const loginMutation = useLogin();

  const handleRegister = () => {
    router.push('/register');
  };

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      
      const user = await handleLoginSuccess(response, {
        email: data.email,
        password: data.password,
      });
      
      // Check if user needs verification
      const verification = needsVerification(user);
      if (verification.needsAny) {
        router.push('/verification');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error - you might want to show a toast or error message
    }
  };
  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} onRegister={handleRegister} />
    </>
  );
}
