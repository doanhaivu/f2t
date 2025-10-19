// Export timeline components
export { OrderStatusTimeline } from './order-status-timeline';
export { OrderTimelineEvent } from './order-timeline-event';
export { 
  OrderStatusBadge,
  statusConfig,
  getStatusLabel,
  getStatusDescription,
  getStatusColor,
  getStatusBgColor,
} from './order-status-badge';

// Export timeline utilities
export {
  sortTimelineEvents,
  filterTimelineEventsByStatus,
  filterTimelineEventsByUpdatedBy,
  getMostRecentEvent,
  getFirstEvent,
  getTimeBetweenEvents,
  formatDuration,
  getTimeSinceEvent,
  isRecentEvent,
  groupEventsByDate,
  getEventByStatus,
  hasStatusOccurred,
  getUniqueStatuses,
  getAverageTimeBetweenStatuses,
  getExpectedNextStatus,
  isTimelineComplete,
  getTimelineProgress,
  formatEventTimestamp,
} from './timeline-utils';
