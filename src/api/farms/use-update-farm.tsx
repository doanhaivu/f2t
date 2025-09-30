import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type { UpdateFarmRequest, UpdateFarmResponse } from './types';

type Variables = UpdateFarmRequest;
type Response = UpdateFarmResponse;

export const useUpdateFarm = createMutation<Response, Variables, Error>({
  mutationFn: async (variables) => {
    const { id, ...updateData } = variables;

    return client({
      url: `/farms/${id}`,
      method: 'PUT',
      data: updateData,
    }).then((response) => response.data);
  },
  onSuccess: (data, _variables) => {
    console.log('Farm updated successfully:', data.data?.name);
    // You could add additional side effects here like:
    // - Invalidating related queries
    // - Showing success notification
    // - Updating cache
  },
  onError: (error, _variables) => {
    console.error('Failed to update farm:', error);
    // Handle error logging or notifications
  },
});
