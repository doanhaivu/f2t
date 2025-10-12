// Mock MMKV with comprehensive functionality
const mockStorage = {
  getString: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clearAll: jest.fn(),
  getAllKeys: jest.fn(() => []),
  contains: jest.fn(() => false),
};

// Mock MMKV before importing the cart module
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => mockStorage),
}));

import { renderHook, act } from '@testing-library/react-native';
import { 
  getCartStorageInfo, 
  cleanupCartStorage,
  useCartStorage,
  useCartPersistence 
} from './index';

describe('Cart Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getString.mockReturnValue(null);
    mockStorage.set.mockImplementation(() => {});
    mockStorage.delete.mockImplementation(() => {});
    mockStorage.clearAll.mockImplementation(() => {});
    mockStorage.getAllKeys.mockReturnValue([]);
    mockStorage.contains.mockReturnValue(false);
  });

  describe('getCartStorageInfo', () => {
    it('should return storage information when cart data exists', () => {
      const cartData = JSON.stringify({
        state: { items: [], lastUpdated: '2024-01-15T10:00:00Z' },
        version: 1,
      });
      
      mockStorage.getString.mockReturnValue(cartData);
      mockStorage.getAllKeys.mockReturnValue(['cart-storage', 'other-key']);

      const info = getCartStorageInfo();

      expect(info).toEqual({
        hasCartData: true,
        storageKeys: ['cart-storage', 'other-key'],
        cartDataSize: cartData.length,
        lastModified: expect.any(String),
      });
    });

    it('should return empty info when no cart data exists', () => {
      mockStorage.getString.mockReturnValue(null);
      mockStorage.getAllKeys.mockReturnValue([]);

      const info = getCartStorageInfo();

      expect(info).toEqual({
        hasCartData: false,
        storageKeys: [],
        cartDataSize: 0,
        lastModified: null,
      });
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.getString.mockImplementation(() => {
        throw new Error('Storage read failed');
      });
      mockStorage.getAllKeys.mockImplementation(() => {
        throw new Error('Storage keys failed');
      });

      const info = getCartStorageInfo();

      expect(info).toEqual({
        hasCartData: false,
        storageKeys: [],
        cartDataSize: 0,
        lastModified: null,
      });
    });
  });

  describe('cleanupCartStorage', () => {
    it('should clean up old cart keys', () => {
      mockStorage.getAllKeys.mockReturnValue([
        'cart-storage',
        'cart-old-key-1',
        'cart-old-key-2',
        'other-key',
        'cart-temp-key',
      ]);

      const result = cleanupCartStorage();

      expect(mockStorage.delete).toHaveBeenCalledWith('cart-old-key-1');
      expect(mockStorage.delete).toHaveBeenCalledWith('cart-old-key-2');
      expect(mockStorage.delete).toHaveBeenCalledWith('cart-temp-key');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('cart-storage');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('other-key');

      expect(result).toEqual({
        cleanedKeys: ['cart-old-key-1', 'cart-old-key-2', 'cart-temp-key'],
        remainingKeys: ['cart-storage', 'other-key'],
      });
    });

    it('should handle no cart keys to clean', () => {
      mockStorage.getAllKeys.mockReturnValue(['cart-storage', 'other-key']);

      const result = cleanupCartStorage();

      expect(mockStorage.delete).not.toHaveBeenCalled();
      expect(result).toEqual({
        cleanedKeys: [],
        remainingKeys: ['cart-storage', 'other-key'],
      });
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.getAllKeys.mockImplementation(() => {
        throw new Error('Storage keys failed');
      });

      const result = cleanupCartStorage();

      expect(result).toEqual({
        cleanedKeys: [],
        remainingKeys: [],
      });
    });
  });

  describe('useCartStorage hook', () => {
    it('should provide storage-related cart state', () => {
      const { result } = renderHook(() => useCartStorage());

      expect(result.current).toHaveProperty('lastUpdated');
      expect(result.current).toHaveProperty('clearStorage');
      expect(result.current).toHaveProperty('hydrate');
    });
  });

  describe('useCartPersistence hook', () => {
    it('should provide persistence-related cart actions', () => {
      const { result } = renderHook(() => useCartPersistence());

      expect(result.current).toHaveProperty('hydrate');
      expect(result.current).toHaveProperty('clearStorage');
    });
  });
});
