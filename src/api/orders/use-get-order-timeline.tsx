import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { OrderTimelineEvent } from './types';
import type { ApiResponse } from '@/types';

type GetOrderTimelineVariables = {
  orderId: string;
};

type OrderTimelineResponse = ApiResponse<{
  events: OrderTimelineEvent[];
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
  };
}>;

export const useGetOrderTimeline = createQuery<
  OrderTimelineResponse,
  GetOrderTimelineVariables,
  Error
>({
  queryKey: ['order-timeline'],
  fetcher: async (variables) => {
    const { orderId } = variables;
    const response = await client.get<OrderTimelineResponse>(
      `/orders/${orderId}/timeline`
    );
    return response.data;
  },
});

