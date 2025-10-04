import React from 'react';

import { Text, View } from '@/components/ui';
import { formatPrice } from '@/api/products';
import type { Product } from '@/types';

type InventoryStatsProps = {
  products: Product[];
};

// Calculate inventory statistics
const calculateStats = (products: Product[]) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'available').length;
  const inStockProducts = products.filter(p => p.availableQuantity > 0).length;
  const lowStockProducts = products.filter(p => p.availableQuantity > 0 && p.availableQuantity <= 5).length;
  const outOfStockProducts = products.filter(p => p.availableQuantity === 0).length;
  
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.pricePerUnit * product.availableQuantity);
  }, 0);

  const totalQuantity = products.reduce((sum, product) => {
    return sum + product.availableQuantity;
  }, 0);

  return {
    totalProducts,
    activeProducts,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
    totalValue,
    totalQuantity,
  };
};

// Individual stat card component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'gray' 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
}) => {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  const textColorClasses = {
    gray: 'text-gray-900 dark:text-white',
    green: 'text-green-900 dark:text-green-100',
    yellow: 'text-yellow-900 dark:text-yellow-100',
    red: 'text-red-900 dark:text-red-100',
    blue: 'text-blue-900 dark:text-blue-100',
  };

  return (
    <View className={`flex-1 rounded-lg border p-3 ${colorClasses[color]}`}>
      <Text className={`text-2xl font-bold ${textColorClasses[color]}`}>
        {value}
      </Text>
      <Text className={`text-sm font-medium ${textColorClasses[color]}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className={`text-xs opacity-75 ${textColorClasses[color]}`}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export const InventoryStats = ({ products }: InventoryStatsProps) => {
  const stats = calculateStats(products);

  if (products.length === 0) {
    return (
      <View className="mx-4 mb-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <Text className="text-center text-gray-600 dark:text-gray-400">
          No products in inventory yet
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-500">
          Add your first product to get started
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-4">
      {/* Top row - Overview */}
      <View className="mb-3 flex-row space-x-3">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={`${stats.activeProducts} active`}
          color="blue"
        />
        <StatCard
          title="Total Value"
          value={formatPrice(stats.totalValue)}
          subtitle={`${stats.totalQuantity} items`}
          color="green"
        />
      </View>

      {/* Bottom row - Stock Status */}
      <View className="flex-row space-x-3">
        <StatCard
          title="In Stock"
          value={stats.inStockProducts}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          color="yellow"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          color="red"
        />
      </View>
    </View>
  );
};
