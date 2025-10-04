import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { client } from '../common/client';
import type { GetProductsRequest, GetProductsResponse } from './types';

type Variables = GetProductsRequest;
type Response = GetProductsResponse;

// Regular paginated query
export const useGetProducts = createQuery<Response, Variables, Error>({
  queryKey: ['products'],
  fetcher: async (variables) => {
    const params = new URLSearchParams();
    
    if (variables.page) params.append('page', variables.page.toString());
    if (variables.limit) params.append('limit', variables.limit.toString());
    if (variables.search) params.append('search', variables.search);
    if (variables.category) params.append('category', variables.category);
    if (variables.farmId) params.append('farmId', variables.farmId);
    if (variables.minPrice) params.append('minPrice', variables.minPrice.toString());
    if (variables.maxPrice) params.append('maxPrice', variables.maxPrice.toString());
    if (variables.organicOnly) params.append('organicOnly', 'true');
    if (variables.inSeason) params.append('inSeason', 'true');
    if (variables.inStock) params.append('inStock', 'true');
    if (variables.sortBy) params.append('sortBy', variables.sortBy);
    if (variables.sortOrder) params.append('sortOrder', variables.sortOrder);
    if (variables.location) {
      params.append('latitude', variables.location.latitude.toString());
      params.append('longitude', variables.location.longitude.toString());
      params.append('radius', variables.location.radius.toString());
    }

    const response = await client.get(`/products?${params.toString()}`);
    return response.data;
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});

// Infinite scroll query
export const useGetProductsInfinite = createInfiniteQuery<
  Response,
  Omit<Variables, 'page'>,
  Error
>({
  queryKey: ['products-infinite'],
  fetcher: async ({ pageParam = 1, ...variables }: { pageParam?: number } & Omit<Variables, 'page'>) => {
    const params = new URLSearchParams();
    
    params.append('page', pageParam.toString());
    if (variables.limit) params.append('limit', variables.limit.toString());
    if (variables.search) params.append('search', variables.search);
    if (variables.category) params.append('category', variables.category);
    if (variables.farmId) params.append('farmId', variables.farmId);
    if (variables.minPrice) params.append('minPrice', variables.minPrice.toString());
    if (variables.maxPrice) params.append('maxPrice', variables.maxPrice.toString());
    if (variables.organicOnly) params.append('organicOnly', 'true');
    if (variables.inSeason) params.append('inSeason', 'true');
    if (variables.inStock) params.append('inStock', 'true');
    if (variables.sortBy) params.append('sortBy', variables.sortBy);
    if (variables.sortOrder) params.append('sortOrder', variables.sortOrder);
    if (variables.location) {
      params.append('latitude', variables.location.latitude.toString());
      params.append('longitude', variables.location.longitude.toString());
      params.append('radius', variables.location.radius.toString());
    }

    const response = await client.get(`/products?${params.toString()}`);
    return response.data;
  },
  getNextPageParam: (lastPage) => {
    if (lastPage.success && lastPage.data?.hasMore) {
      return (lastPage.data.page || 0) + 1;
    }
    return undefined;
  },
  initialPageParam: 1,
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});
