import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type { DeleteFarmRequest, DeleteFarmResponse } from './types';

type Variables = DeleteFarmRequest;
type Response = DeleteFarmResponse;

export const useDeleteFarm = createMutation<Response, Variables, Error>({
  mutationFn: async (variables) =>
    client({
      url: `/farms/${variables.id}`,
      method: 'DELETE',
    }).then((response) => response.data),
  onSuccess: (data, variables) => {
    console.log('Farm deleted successfully:', variables.id);
    // You could add additional side effects here like:
    // - Invalidating farm lists
    // - Showing success notification
    // - Navigating away from farm profile
    // - Clearing cache
  },
  onError: (error, _variables) => {
    console.error('Failed to delete farm:', error);
    // Handle error logging or notifications
  },
});
