import { createMutation } from 'react-query-kit';

import { client } from '../common/client';
import type { CreateProductRequest, CreateProductResponse } from './types';

type Variables = CreateProductRequest;
type Response = CreateProductResponse;

export const useCreateProduct = createMutation<Response, Variables, Error>({
  mutationFn: async (variables) => {
    const response = await client.post('/products', variables);
    return response.data;
  },
  onSuccess: (_data, _variables) => {
    // TODO: Invalidate product queries
    console.log('Product created successfully');
  },
  onError: (error, _variables) => {
    console.error('Failed to create product:', error);
  },
});
