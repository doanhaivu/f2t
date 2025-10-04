import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type { UpdateStockRequest, UpdateStockResponse } from './types';

type Variables = UpdateStockRequest;
type Response = UpdateStockResponse;

export const useUpdateStock = createMutation<Response, Variables, Error>({
  mutationFn: async (variables) => {
    const { id, ...updateData } = variables;
    const response = await client.patch(`/products/${id}/stock`, updateData);
    return response.data;
  },
  onSuccess: (_data, _variables) => {
    // TODO: Invalidate product queries
    console.log('Product stock updated successfully');
  },
  onError: (error, _variables) => {
    console.error('Failed to update product stock:', error);
  },
});
