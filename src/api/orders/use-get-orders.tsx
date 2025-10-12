import type { AxiosError } from 'axios';
import { createQuery, createInfiniteQuery } from 'react-query-kit';

import { client } from '../common/client';
import type { GetOrdersRequest, OrdersResponse } from './types';

// Get orders query
export const useGetOrders = createQuery<OrdersResponse, GetOrdersRequest, AxiosError>({
  queryKey: ['orders'],
  fetcher: async (params) =>
    client({
      url: 'orders',
      method: 'GET',
      params,
    }).then((response) => response.data),
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});

// Get orders infinite query for pagination
export const useGetOrdersInfinite = createInfiniteQuery<OrdersResponse, GetOrdersRequest, AxiosError>({
  queryKey: ['orders-infinite'],
  fetcher: async ({ pageParam = 1, ...params }: GetOrdersRequest & { pageParam?: number }) =>
    client({
      url: 'orders',
      method: 'GET',
      params: { ...params, page: pageParam },
    }).then((response) => response.data),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    return lastPage.success && lastPage.data?.hasMore 
      ? (lastPage.data.page || 1) + 1 
      : undefined;
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});
