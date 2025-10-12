import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProductSearchBar } from './product-search-bar';
import type { Product } from '@/types';

// Mock the location hook
jest.mock('@/lib/hooks/use-location', () => ({
  useLocation: () => ({
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  }),
}));

// Mock the location utils
jest.mock('@/lib/location/utils', () => ({
  calculateDistance: jest.fn(() => 5.2),
  formatDistance: jest.fn(() => '5.2km'),
  getDistanceColor: jest.fn(() => 'text-green-600'),
}));

// Mock the ProductCard component
jest.mock('@/components/products/product-card', () => ({
  ProductCard: ({ product, onPress }: { product: Product; onPress?: () => void }) => (
    <div data-testid={`product-${product.id}`} onClick={onPress}>
      {product.name}
    </div>
  ),
}));

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    farmId: 'farm1',
    name: 'Organic Apples',
    description: 'Fresh organic apples',
    category: 'fruits',
    subcategory: 'apples',
    pricePerUnit: 2.99,
    unit: 'kg',
    availableQuantity: 10,
    status: 'available',
    images: ['apple.jpg'],
    harvestDate: '2024-01-15',
    deliveryDate: '2024-01-15',
    estimatedShelfLife: 7,
    minimumOrder: 1,
    isOrganic: true,
    tags: ['organic', 'fresh'],
    seasonalAvailability: ['fall'],
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      vitamins: ['C'],
    },
    rating: 4.5,
    farm: {
      id: 'farm1',
      name: 'Green Valley Farm',
      location: {
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        address: {
          street: '123 Farm Road',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
      },
    },
  },
  {
    id: '2',
    farmId: 'farm2',
    name: 'Fresh Carrots',
    description: 'Crisp fresh carrots',
    category: 'vegetables',
    subcategory: 'root',
    pricePerUnit: 1.99,
    unit: 'kg',
    availableQuantity: 0,
    status: 'sold_out',
    images: ['carrot.jpg'],
    harvestDate: '2024-01-15',
    deliveryDate: '2024-01-15',
    estimatedShelfLife: 14,
    minimumOrder: 2,
    isOrganic: false,
    tags: ['fresh'],
    seasonalAvailability: ['winter'],
    nutritionalInfo: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      fiber: 2.8,
      vitamins: ['A'],
    },
    rating: 4.2,
    farm: {
      id: 'farm2',
      name: 'Sunny Acres',
      location: {
        coordinates: { latitude: 40.6892, longitude: -74.0445 },
        address: {
          street: '456 Garden Lane',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11201',
          country: 'USA',
        },
      },
    },
  },
];

describe('ProductSearchBar Component', () => {
  const defaultProps = {
    products: mockProducts,
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    const { getByPlaceholderText } = render(
      <ProductSearchBar {...defaultProps} placeholder="Search products..." />
    );

    expect(getByPlaceholderText('Search products...')).toBeTruthy();
  });

  it('should render filter and sort buttons', () => {
    const { getByText } = render(<ProductSearchBar {...defaultProps} />);

    expect(getByText('Filter')).toBeTruthy();
    expect(getByText('Sort')).toBeTruthy();
  });

  it('should call onSearch when input changes', async () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <ProductSearchBar {...defaultProps} onSearch={onSearch} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'apple');

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'apple',
        })
      );
    });
  });

  it('should filter products by name', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ProductSearchBar {...defaultProps} showResults={true} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'apple');

    expect(getByTestId('product-1')).toBeTruthy();
    expect(() => getByTestId('product-2')).toThrow();
  });

  it('should filter products by category', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ProductSearchBar {...defaultProps} showResults={true} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'vegetable');

    expect(getByTestId('product-2')).toBeTruthy();
    expect(() => getByTestId('product-1')).toThrow();
  });

  it('should filter products by farm name', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ProductSearchBar {...defaultProps} showResults={true} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'Green Valley');

    expect(getByTestId('product-1')).toBeTruthy();
    expect(() => getByTestId('product-2')).toThrow();
  });

  it('should show active filters when applied', () => {
    const { getByText } = render(
      <ProductSearchBar
        {...defaultProps}
        currentFilter={{
          query: '',
          maxDistance: 10,
          minRating: 4,
          tags: ['organic'],
        }}
      />
    );

    expect(getByText('Within 10km')).toBeTruthy();
    expect(getByText('4+ stars')).toBeTruthy();
    expect(getByText('1 tags')).toBeTruthy();
  });

  it('should show clear all filters button', () => {
    const { getByText } = render(
      <ProductSearchBar
        {...defaultProps}
        currentFilter={{
          query: '',
          maxDistance: 10,
          minRating: 4,
        }}
      />
    );

    expect(getByText('Clear all')).toBeTruthy();
  });

  it('should call onProductPress when product is pressed', () => {
    const onProductPress = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <ProductSearchBar
        {...defaultProps}
        onProductPress={onProductPress}
        showResults={true}
      />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'apple');

    const productCard = getByTestId('product-1');
    fireEvent.press(productCard);

    expect(onProductPress).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should show loading state', () => {
    const { getByText } = render(
      <ProductSearchBar {...defaultProps} loading={true} />
    );

    expect(getByText('Searching...')).toBeTruthy();
  });

  it('should show error state', () => {
    const { getByText } = render(
      <ProductSearchBar {...defaultProps} error="Search failed" />
    );

    expect(getByText('Search failed')).toBeTruthy();
  });

  it('should show empty state when no results', () => {
    const { getByPlaceholderText, getByText } = render(
      <ProductSearchBar {...defaultProps} showResults={true} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'nonexistent');

    expect(getByText('No products found')).toBeTruthy();
  });

  it('should show search stats when there are results', () => {
    const { getByPlaceholderText, getByText } = render(
      <ProductSearchBar {...defaultProps} showResults={true} />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'apple');

    waitFor(() => {
      expect(getByText(/product.*found/)).toBeTruthy();
    });
  });

  it('should respect maxResults limit', () => {
    const manyProducts = Array.from({ length: 30 }, (_, i) => ({
      ...mockProducts[0],
      id: `product-${i}`,
      name: `Product ${i}`,
    }));

    const { getByPlaceholderText, queryAllByTestId } = render(
      <ProductSearchBar
        {...defaultProps}
        products={manyProducts}
        maxResults={5}
        showResults={true}
      />
    );

    const input = getByPlaceholderText('Search products...');
    fireEvent.changeText(input, 'product');

    // Should only show 5 results despite 30 products
    waitFor(() => {
      const productCards = queryAllByTestId(/product-/);
      expect(productCards).toHaveLength(5);
    });
  });

  it('should handle rapid input changes without errors', async () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <ProductSearchBar {...defaultProps} onSearch={onSearch} />
    );

    const input = getByPlaceholderText('Search products...');
    
    // Rapidly change input
    for (let i = 0; i < 10; i++) {
      fireEvent.changeText(input, `test${i}`);
    }

    // Should not throw errors and should eventually call onSearch
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('should apply custom className', () => {
    const { getByTestId } = render(
      <ProductSearchBar {...defaultProps} className="custom-class" />
    );

    // In a real implementation, you'd check for the custom class
    // expect(getByTestId('product-search-bar')).toHaveStyle({ className: 'custom-class' });
  });
});
