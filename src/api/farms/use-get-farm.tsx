import { createQuery } from 'react-query-kit';

import { client } from '../common/client';
import type { GetFarmRequest, GetFarmResponse } from './types';

type Variables = GetFarmRequest;
type Response = GetFarmResponse;

export const useGetFarm = createQuery<Response, Variables, Error>({
  queryKey: ['farm'],
  fetcher: async (variables) =>
    client({
      url: `/farms/${variables.id}`,
      method: 'GET',
    }).then((response) => response.data),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});
