import { createInfiniteQuery } from 'react-query-kit';

import { client } from '../common/client';
import { USE_MOCK_DATA, simulateNetworkDelay } from '../common/config';
import type { GetFarmsRequest, GetFarmsResponse } from './types';
import { getMockFarms } from './mock-farms';

type Variables = Omit<GetFarmsRequest, 'page'>;
type Response = GetFarmsResponse;

export const useGetFarms = createInfiniteQuery<Response, Variables, Error>({
  queryKey: ['farms'],
  fetcher: async (variables, { pageParam = 1 }) => {
    // Return mock data if enabled
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await simulateNetworkDelay();
      
      return getMockFarms({
        page: pageParam,
        limit: variables.limit,
        search: variables.search,
        deliveryMethod: variables.deliveryMethod,
        location: variables.location,
        sortBy: variables.sortBy,
        sortOrder: variables.sortOrder,
        isActive: variables.isActive,
      });
    }

    // Real API call
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: (variables.limit || 10).toString(),
      ...(variables.search && { search: variables.search }),
      ...(variables.isActive !== undefined && {
        isActive: variables.isActive.toString(),
      }),
      ...(variables.deliveryMethod && {
        deliveryMethod: variables.deliveryMethod,
      }),
      ...(variables.sortBy && { sortBy: variables.sortBy }),
      ...(variables.sortOrder && { sortOrder: variables.sortOrder }),
      ...(variables.location && {
        latitude: variables.location.latitude.toString(),
        longitude: variables.location.longitude.toString(),
        radius: variables.location.radius.toString(),
      }),
    });

    return client({
      url: `/farms?${params.toString()}`,
      method: 'GET',
    }).then((response) => response.data);
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    if (!lastPage.success || !lastPage.data?.hasMore) {
      return undefined;
    }
    return lastPage.data.page + 1;
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});

// Helper hook for getting farms with basic pagination
export const useGetFarmsList = createInfiniteQuery<Response, Variables, Error>({
  queryKey: ['farms', 'list'],
  fetcher: async (variables, { pageParam = 1 }) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: (variables.limit || 20).toString(),
      ...(variables.search && { search: variables.search }),
      ...(variables.isActive !== undefined && {
        isActive: variables.isActive.toString(),
      }),
      sortBy: variables.sortBy || 'name',
      sortOrder: variables.sortOrder || 'asc',
    });

    return client({
      url: `/farms?${params.toString()}`,
      method: 'GET',
    }).then((response) => response.data);
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    if (!lastPage.success || !lastPage.data?.hasMore) {
      return undefined;
    }
    return lastPage.data.page + 1;
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});
