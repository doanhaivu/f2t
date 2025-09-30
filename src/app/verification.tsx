import { useRouter } from 'expo-router';
import React from 'react';

import { VerificationFlow } from '@/components/verification-flow';
import { FocusAwareStatusBar } from '@/components/ui';

export default function VerificationScreen() {
  const router = useRouter();

  const handleVerificationComplete = () => {
    // Navigate to the main app after verification
    router.replace('/');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <VerificationFlow 
        onComplete={handleVerificationComplete}
        allowSkip={true}
      />
    </>
  );
}
