import { createInfiniteQuery } from 'react-query-kit';

import { client } from '../common/client';
import type { GetFarmsRequest, GetFarmsResponse } from './types';

type Variables = Omit<GetFarmsRequest, 'page'>;
type Response = GetFarmsResponse;

export const useGetFarms = createInfiniteQuery<Response, Variables, Error>({
  queryKey: ['farms'],
  fetcher: async (variables, { pageParam = 1 }) => {
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
