// Product API Types
export type {
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetProductRequest,
  GetProductResponse,
  GetProductsRequest,
  GetProductsResponse,
  ProductCategory,
  ProductSearchFilters,
  ProductUnit,
  UpdateProductRequest,
  UpdateProductResponse,
  UpdateStockRequest,
  UpdateStockResponse,
} from './types';

export {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from './types';

// Product CRUD Operations
export { useCreateProduct } from './use-create-product';
export { useDeleteProduct } from './use-delete-product';
export { useGetProduct } from './use-get-product';
export { useGetProducts, useGetProductsInfinite } from './use-get-products';
export { useUpdateProduct } from './use-update-product';
export { useUpdateStock } from './use-update-stock';

// Utility Functions
export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const formatUnit = (unit: string): string => {
  const unitLabels: Record<string, string> = {
    lb: 'pound',
    kg: 'kilogram',
    g: 'gram',
    oz: 'ounce',
    bunch: 'bunch',
    each: 'each',
    dozen: 'dozen',
    pint: 'pint',
    quart: 'quart',
    gallon: 'gallon',
    liter: 'liter',
    bag: 'bag',
    box: 'box',
  };
  
  return unitLabels[unit] || unit;
};

export const formatPricePerUnit = (price: number, unit: string): string => {
  return `${formatPrice(price)} per ${formatUnit(unit)}`;
};

export const getCategoryLabel = (category: string): string => {
  const categoryLabels: Record<string, string> = {
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    herbs: 'Herbs',
    dairy: 'Dairy',
    meat: 'Meat',
    grains: 'Grains',
    nuts_seeds: 'Nuts & Seeds',
    honey: 'Honey',
    eggs: 'Eggs',
    flowers: 'Flowers',
    other: 'Other',
  };
  
  return categoryLabels[category] || category;
};

export const isProductInSeason = (product: {
  seasonalAvailability?: {
    startMonth: number;
    endMonth: number;
  };
}): boolean => {
  if (!product.seasonalAvailability) return true;
  
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const { startMonth, endMonth } = product.seasonalAvailability;
  
  if (startMonth <= endMonth) {
    // Same year season (e.g., March to August)
    return currentMonth >= startMonth && currentMonth <= endMonth;
  } else {
    // Cross-year season (e.g., November to February)
    return currentMonth >= startMonth || currentMonth <= endMonth;
  }
};

export const isProductFresh = (harvestDate?: string): boolean => {
  if (!harvestDate) return false;
  
  const harvest = new Date(harvestDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24));
  
  // Consider fresh if harvested within 7 days
  return daysDiff <= 7;
};

export const isProductExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  return now > expiry;
};

export const getProductAvailabilityStatus = (product: {
  stockQuantity: number;
  isActive: boolean;
  expiryDate?: string;
}): 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'inactive' => {
  if (!product.isActive) return 'inactive';
  if (isProductExpired(product.expiryDate)) return 'expired';
  if (product.stockQuantity === 0) return 'out_of_stock';
  if (product.stockQuantity <= 5) return 'low_stock'; // Configurable threshold
  return 'available';
};

export const formatHarvestTime = (harvestDate?: string): string => {
  if (!harvestDate) return 'Harvest date not specified';
  
  const harvest = new Date(harvestDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'Harvested today';
  if (daysDiff === 1) return 'Harvested yesterday';
  if (daysDiff <= 7) return `Harvested ${daysDiff} days ago`;
  
  return harvest.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: harvest.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const getSeasonalAvailabilityText = (seasonalAvailability?: {
  startMonth: number;
  endMonth: number;
}): string => {
  if (!seasonalAvailability) return 'Available year-round';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const { startMonth, endMonth } = seasonalAvailability;
  const startMonthName = months[startMonth - 1];
  const endMonthName = months[endMonth - 1];
  
  if (startMonth === endMonth) {
    return `Available in ${startMonthName}`;
  }
  
  return `Available ${startMonthName} - ${endMonthName}`;
};

export const searchProducts = (
  products: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm.trim()) return products;
  
  const term = searchTerm.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term) ||
    (product.farm?.name || '').toLowerCase().includes(term)
  );
};

export const filterProducts = (
  products: any[],
  filters: Partial<{
    category?: string;
    priceRange?: { min: number; max: number };
    organicOnly?: boolean;
    inSeason?: boolean;
    inStock?: boolean;
  }>
): any[] => {
  return products.filter(product => {
    // Category filter
    if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    
    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }
    
    // Organic filter
    if (filters.organicOnly && !product.organicCertified) {
      return false;
    }
    
    // In season filter
    if (filters.inSeason && !isProductInSeason(product)) {
      return false;
    }
    
    // In stock filter
    if (filters.inStock && product.stockQuantity === 0) {
      return false;
    }
    
    return true;
  });
};

export const sortProducts = (
  products: any[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): any[] => {
  const sorted = [...products].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'harvestDate':
        aValue = new Date(a.harvestDate || 0);
        bValue = new Date(b.harvestDate || 0);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      case 'popularity':
        aValue = a.popularity || 0;
        bValue = b.popularity || 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};
