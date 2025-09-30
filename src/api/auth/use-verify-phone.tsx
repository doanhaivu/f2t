import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type {
  VerifyPhoneRequest,
  SendPhoneVerificationRequest,
  VerificationResponse,
} from './types';

export const useVerifyPhone = createMutation<
  VerificationResponse,
  VerifyPhoneRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'auth/verify-phone',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});

export const useSendPhoneVerification = createMutation<
  VerificationResponse,
  SendPhoneVerificationRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'auth/send-phone-verification',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
