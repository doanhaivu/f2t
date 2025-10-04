import { createQuery } from 'react-query-kit';

import { client } from '../common/client';
import type { GetProductRequest, GetProductResponse } from './types';

type Variables = GetProductRequest;
type Response = GetProductResponse;

export const useGetProduct = createQuery<Response, Variables, Error>({
  queryKey: ['product'],
  fetcher: async (variables) => {
    const response = await client.get(`/products/${variables.id}`);
    return response.data;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});
