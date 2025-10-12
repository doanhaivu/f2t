// Location service exports
export { useLocation } from '../hooks/use-location';
export type { LocationCoordinates, LocationPermission, LocationState } from '../hooks/use-location';

// Location utilities
export {
  calculateDistance,
  isWithinRadius,
  formatDistance,
  getDistanceCategory,
  getDistanceColor,
  getDistanceIcon,
  calculateDeliveryTime,
  isDeliveryAvailable,
  calculateDeliveryFee,
  sortByDistance,
  filterByRadius,
  getBoundingBox,
  isValidCoordinates,
  coordinatesToKey,
  keyToCoordinates,
  reverseGeocode,
  calculateCenter,
} from './utils';
