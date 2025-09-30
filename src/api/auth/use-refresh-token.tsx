import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type { RefreshTokenRequest, AuthResponse } from './types';

export const useRefreshToken = createMutation<
  AuthResponse,
  RefreshTokenRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'auth/refresh',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
