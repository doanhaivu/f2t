// Export all order hooks
export { useCreateOrder } from './use-create-order';
export { useGetOrder } from './use-get-order';
export { useGetOrders, useGetOrdersInfinite } from './use-get-orders';
export { useUpdateOrder } from './use-update-order';
export { useCancelOrder } from './use-cancel-order';
export { useRefundOrder } from './use-refund-order';
export { useUpdateOrderStatus } from './use-update-order-status';
export { useOrderStats } from './use-order-stats';

// Export mock data
export { MOCK_ORDERS, getMockOrders, getMockOrder } from './mock-orders';

// Export order tracking hooks
export { useTrackOrder } from './use-track-order';
export { useGetOrderTimeline } from './use-get-order-timeline';
export { useGetDeliveryStatus } from './use-get-delivery-status';
export type { DeliveryStatus } from './use-get-delivery-status';
export { 
  useOrderStatusSubscription, 
  useMultipleOrdersStatusSubscription 
} from './use-order-status-subscription';

// Export all order types
export type {
  Order,
  OrderItem,
  OrderAddress,
  OrderTimelineEvent,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  DeliveryMethod,
  CreateOrderRequest,
  UpdateOrderRequest,
  GetOrderRequest,
  GetOrdersRequest,
  CancelOrderRequest,
  RefundOrderRequest,
  UpdateOrderStatusRequest,
  OrderResponse,
  OrdersResponse,
  CreateOrderResponse,
  UpdateOrderResponse,
  CancelOrderResponse,
  RefundOrderResponse,
  OrderStatsResponse,
  OrderFilters,
  OrderSortBy,
  OrderSortOrder,
  OrderSearchFilters,
} from './types';

// Order utility functions
import type { Order, OrderStatus, PaymentStatus, OrderItem } from './types';

// Format order status for display
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[status] || status;
};

// Format payment status for display
export const formatPaymentStatus = (status: PaymentStatus): string => {
  const statusMap: Record<PaymentStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

// Get order status color
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    preparing: 'orange',
    ready_for_pickup: 'purple',
    out_for_delivery: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
  };
  return colorMap[status] || 'gray';
};

// Get payment status color
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colorMap: Record<PaymentStatus, string> = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    refunded: 'gray',
    cancelled: 'red',
  };
  return colorMap[status] || 'gray';
};

// Calculate order progress percentage
export const calculateOrderProgress = (status: OrderStatus): number => {
  const progressMap: Record<OrderStatus, number> = {
    pending: 10,
    confirmed: 25,
    preparing: 50,
    ready_for_pickup: 75,
    out_for_delivery: 90,
    delivered: 100,
    cancelled: 0,
    refunded: 0,
  };
  return progressMap[status] || 0;
};

// Check if order can be cancelled
export const canCancelOrder = (order: Order): boolean => {
  const cancellableStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing'];
  return cancellableStatuses.includes(order.status) && order.paymentStatus !== 'completed';
};

// Check if order can be refunded
export const canRefundOrder = (order: Order): boolean => {
  return order.paymentStatus === 'completed' && 
         ['delivered', 'cancelled'].includes(order.status) &&
         !order.refundAmount;
};

// Check if order is active (not completed/cancelled)
export const isOrderActive = (order: Order): boolean => {
  return !['delivered', 'cancelled', 'refunded'].includes(order.status);
};

// Get estimated delivery time
export const getEstimatedDeliveryTime = (order: Order): string | null => {
  if (order.estimatedDeliveryTime) {
    return order.estimatedDeliveryTime;
  }
  
  if (order.deliveryDate) {
    const deliveryDate = new Date(order.deliveryDate);
    const now = new Date();
    const diffHours = Math.ceil((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  }
  
  return null;
};

// Format order timeline event
export const formatTimelineEvent = (event: any): string => {
  const timestamp = new Date(event.timestamp).toLocaleString();
  return `${event.description} - ${timestamp}`;
};

// Group orders by status
export const groupOrdersByStatus = (orders: Order[]): Record<OrderStatus, Order[]> => {
  const groups = {} as Record<OrderStatus, Order[]>;
  
  // Initialize all possible statuses with empty arrays
  const allStatuses: OrderStatus[] = [
    'pending', 'confirmed', 'preparing', 'ready_for_pickup', 
    'out_for_delivery', 'delivered', 'cancelled', 'refunded'
  ];
  
  allStatuses.forEach(status => {
    groups[status] = [];
  });
  
  // Group orders by status
  orders.forEach(order => {
    groups[order.status].push(order);
  });
  
  return groups;
};

// Sort orders by date
export const sortOrdersByDate = (orders: Order[], ascending = false): Order[] => {
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Filter orders by date range
export const filterOrdersByDateRange = (
  orders: Order[], 
  startDate: string, 
  endDate: string
): Order[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt).getTime();
    return orderDate >= start && orderDate <= end;
  });
};

// Calculate order statistics
export const calculateOrderStats = (orders: Order[]) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const ordersByStatus = groupOrdersByStatus(orders);
  const statusCounts = Object.keys(ordersByStatus).reduce((acc, status) => {
    acc[status as OrderStatus] = ordersByStatus[status as OrderStatus].length;
    return acc;
  }, {} as Record<OrderStatus, number>);
  
  const activeOrders = orders.filter(isOrderActive).length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    activeOrders,
    completedOrders,
    cancelledOrders,
    ordersByStatus: statusCounts,
  };
};

// Generate order summary text
export const generateOrderSummary = (order: Order): string => {
  const itemCount = order.totalItems;
  const total = order.total.toFixed(2);
  const status = formatOrderStatus(order.status);
  
  return `${itemCount} item${itemCount !== 1 ? 's' : ''} • $${total} • ${status}`;
};

// Check if order needs attention
export const needsAttention = (order: Order): boolean => {
  // Orders that need attention
  const attentionStatuses: OrderStatus[] = ['pending', 'confirmed'];
  const attentionPaymentStatuses: PaymentStatus[] = ['failed', 'pending'];
  
  return attentionStatuses.includes(order.status) || 
         attentionPaymentStatuses.includes(order.paymentStatus);
};

// Get order priority
export const getOrderPriority = (order: Order): 'high' | 'medium' | 'low' => {
  if (needsAttention(order)) {
    return 'high';
  }
  
  if (['preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)) {
    return 'medium';
  }
  
  if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
    return 'low';
  }
  
  return 'low';
};

// Format order number for display
export const formatOrderNumber = (orderNumber: string): string => {
  // Add formatting like #12345 or ORD-12345
  return `#${orderNumber}`;
};

// Calculate order age in days
export const getOrderAge = (order: Order): number => {
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - orderDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if order is overdue
export const isOrderOverdue = (order: Order): boolean => {
  if (order.deliveryDate) {
    const deliveryDate = new Date(order.deliveryDate);
    const now = new Date();
    return deliveryDate < now && !['delivered', 'cancelled', 'refunded'].includes(order.status);
  }
  return false;
};

