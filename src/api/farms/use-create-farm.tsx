import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type {
  CreateFarmProfileRequest,
  CreateFarmProfileResponse,
} from './types';

type Variables = CreateFarmProfileRequest;
type Response = CreateFarmProfileResponse;

export const useCreateFarm = createMutation<Response, Variables, Error>({
  mutationFn: async (variables) =>
    client({
      url: '/farms',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
  onSuccess: (data, _variables) => {
    console.log('Farm created successfully:', data.data?.name);
    // You could add additional side effects here like:
    // - Invalidating farm lists
    // - Showing success notification
    // - Navigating to farm profile
  },
  onError: (error, _variables) => {
    console.error('Failed to create farm:', error);
    // Handle error logging or notifications
  },
});
