import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

import type { Product } from '@/types';

// MMKV storage instance for cart persistence
const storage = new MMKV();

// Cart item type
export type CartItem = {
  id: string; // Unique cart item ID
  productId: string;
  product: Product;
  quantity: number;
  farmId: string;
  addedAt: string; // ISO timestamp
  notes?: string; // Optional customer notes
};

// Cart state interface
interface CartState {
  // State
  items: CartItem[];
  isOpen: boolean;
  lastUpdated: string | null;
  
  // Computed values
  totalItems: number;
  totalPrice: number;
  farms: string[]; // Unique farm IDs in cart
  isEmpty: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  clearFarmItems: (farmId: string) => void;
  
  // Cart visibility
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Utility actions
  getItemByProductId: (productId: string) => CartItem | undefined;
  getItemsByFarm: (farmId: string) => CartItem[];
  canAddItem: (product: Product, quantity: number) => { canAdd: boolean; reason?: string };
  
  // Persistence
  hydrate: () => void;
  clearStorage: () => void;
}

// Helper functions
const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.product.pricePerUnit * item.quantity);
  }, 0);
};

const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const getUniqueFarms = (items: CartItem[]): string[] => {
  return Array.from(new Set(items.map(item => item.farmId)));
};

const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to update computed values
const updateComputedValues = (state: CartState) => {
  const totalItems = calculateTotalItems(state.items);
  const totalPrice = calculateTotalPrice(state.items);
  const farms = getUniqueFarms(state.items);
  const isEmpty = state.items.length === 0;
  
  return {
    totalItems,
    totalPrice,
    farms,
    isEmpty,
  };
};

// Cart store
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      lastUpdated: null,
      
      // Computed values (calculated on each access)
      totalItems: 0,
      totalPrice: 0,
      farms: [],
      isEmpty: true,
      
      // Add item to cart
      addItem: (product: Product, quantity = 1, notes?: string) => {
        const state = get();
        const { canAdd, reason } = state.canAddItem(product, quantity);
        
        if (!canAdd) {
          throw new Error(reason || 'Cannot add item to cart');
        }
        
        // Check if product already exists in cart
        const existingItem = state.getItemByProductId(product.id);
        
        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + quantity;
          const updatedItems = state.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          );
          
          set((state) => ({
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          }));
        } else {
          // Add new item
          const newItem: CartItem = {
            id: generateCartItemId(),
            productId: product.id,
            product,
            quantity,
            farmId: product.farmId,
            addedAt: new Date().toISOString(),
            notes,
          };
          
          const updatedItems = [...state.items, newItem];
          
          set((state) => ({
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          }));
        }
      },
      
      // Remove item from cart
      removeItem: (cartItemId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== cartItemId);
          return {
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          };
        });
      },
      
      // Update item quantity
      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === cartItemId
              ? { ...item, quantity }
              : item
          );
          return {
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          };
        });
      },
      
      // Update item notes
      updateNotes: (cartItemId: string, notes: string) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === cartItemId
              ? { ...item, notes }
              : item
          );
          return {
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          };
        });
      },
      
      // Clear entire cart
      clearCart: () => {
        set((state) => {
          const updatedItems: CartItem[] = [];
          return {
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          };
        });
      },
      
      // Clear items from specific farm
      clearFarmItems: (farmId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.farmId !== farmId);
          return {
            items: updatedItems,
            lastUpdated: new Date().toISOString(),
            ...updateComputedValues({ ...state, items: updatedItems }),
          };
        });
      },
      
      // Cart visibility controls
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      // Get item by product ID
      getItemByProductId: (productId: string) => {
        return get().items.find(item => item.productId === productId);
      },
      
      // Get items by farm
      getItemsByFarm: (farmId: string) => {
        return get().items.filter(item => item.farmId === farmId);
      },
      
      // Check if item can be added
      canAddItem: (product: Product, quantity: number) => {
        const state = get();
        
        // Check if product is available
        if (product.status !== 'available') {
          return { canAdd: false, reason: 'Product is not available' };
        }
        
        // Check stock availability
        if (product.availableQuantity < quantity) {
          return { 
            canAdd: false, 
            reason: `Only ${product.availableQuantity} ${product.unit}s available` 
          };
        }
        
        // Check minimum order quantity
        if (quantity < product.minimumOrder) {
          return { 
            canAdd: false, 
            reason: `Minimum order quantity is ${product.minimumOrder} ${product.unit}s` 
          };
        }
        
        // Check if adding this quantity would exceed stock
        const existingItem = state.getItemByProductId(product.id);
        if (existingItem) {
          const newTotalQuantity = existingItem.quantity + quantity;
          if (newTotalQuantity > product.availableQuantity) {
            return { 
              canAdd: false, 
              reason: `Cannot add ${quantity} more. Only ${product.availableQuantity - existingItem.quantity} ${product.unit}s available` 
            };
          }
        }
        
        return { canAdd: true };
      },
      
      // Hydrate from storage
      hydrate: () => {
        try {
          const stored = storage.getString('cart-storage');
          if (stored) {
            const parsed = JSON.parse(stored);
            const items = parsed.state?.items || [];
            set((state) => ({
              items,
              lastUpdated: parsed.state?.lastUpdated || null,
              ...updateComputedValues({ ...state, items }),
            }));
          }
        } catch (error) {
          console.error('Failed to hydrate cart from storage:', error);
        }
      },
      
      // Clear storage
      clearStorage: () => {
        storage.delete('cart-storage');
        get().clearCart();
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const value = storage.getString(name);
          return value ?? null;
        },
        setItem: (name: string, value: string) => {
          storage.set(name, value);
        },
        removeItem: (name: string) => {
          storage.delete(name);
        },
      })),
      // Only persist items and lastUpdated, not UI state
      partialize: (state) => ({
        items: state.items,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Helper hooks for common cart operations
export const useCartItems = () => useCart((state) => state.items);
export const useCartTotal = () => useCart((state) => state.totalPrice);
export const useCartItemCount = () => useCart((state) => state.totalItems);
export const useCartIsEmpty = () => useCart((state) => state.isEmpty);
export const useCartFarms = () => useCart((state) => state.farms);

// Cart actions hook
export const useCartActions = () => useCart((state) => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateQuantity: state.updateQuantity,
  updateNotes: state.updateNotes,
  clearCart: state.clearCart,
  clearFarmItems: state.clearFarmItems,
  getItemByProductId: state.getItemByProductId,
  getItemsByFarm: state.getItemsByFarm,
  canAddItem: state.canAddItem,
}));

// Cart visibility hook
export const useCartVisibility = () => useCart((state) => ({
  isOpen: state.isOpen,
  openCart: state.openCart,
  closeCart: state.closeCart,
  toggleCart: state.toggleCart,
}));

// Cart persistence hook
export const useCartPersistence = () => useCart((state) => ({
  hydrate: state.hydrate,
  clearStorage: state.clearStorage,
}));
