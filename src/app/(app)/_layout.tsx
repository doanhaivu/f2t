/* eslint-disable react/no-unstable-nested-components */
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Pressable, Text, View } from '@/components/ui';
import {
  Cart as CartIcon,
  Dashboard as DashboardIcon,
  Farm as FarmIcon,
  Feed as FeedIcon,
  Home as HomeIcon,
  Notification as NotificationIcon,
  Orders as OrdersIcon,
  Products as ProductsIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime, useDeveloperMode } from '@/lib';
import { useCartItemCount } from '@/lib/cart';

// Hook for managing app initialization
const useAppInitialization = () => {
  const status = useAuth.use.status();
  const signInBypass = useAuth.use.signInBypass();
  const [isFirstTime] = useIsFirstTime();
  const { shouldBypassLogin } = useDeveloperMode();
  
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  // Bypass login logic for development testing
  useEffect(() => {
    if (shouldBypassLogin && status === 'signOut') {
      console.log('🚀 Bypassing login for development testing');
      // Default bypass as consumer, can change to 'farm' if need to test farm features
      signInBypass('consumer');
    }
  }, [shouldBypassLogin, status, signInBypass]);

  return { status, isFirstTime, shouldBypassLogin };
};

// Cart badge component
const CartBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-red-500">
      <Text className="text-[10px] font-bold text-white">{count > 9 ? '9+' : count}</Text>
    </View>
  );
};

// Tab screens configuration
const TabScreens = () => {
  const isFarm = useAuth.use.isFarm;
  const isUserFarm = isFarm(); // Call the function
  const cartItemCount = useCartItemCount();

  return (
    <>
      {/* Home/Dashboard Tab - Different for consumer vs farm */}
      <Tabs.Screen
        name="index"
        options={{
          title: isUserFarm() ? 'Dashboard' : 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => 
            isUserFarm() ? <DashboardIcon color={color} /> : <HomeIcon color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />

      {/* Products Tab - For consumers to browse, for farms to manage */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          headerShown: false,
          tabBarIcon: ({ color }) => <ProductsIcon color={color} />,
          tabBarButtonTestID: 'products-tab',
          href: isUserFarm() ? '/inventory' : '/products',
        }}
      />

      {/* Farms Tab - Only for consumers */}
      {!isUserFarm() && (
        <Tabs.Screen
          name="farms"
          options={{
            title: 'Farms',
            headerShown: false,
            tabBarIcon: ({ color }) => <FarmIcon color={color} />,
            tabBarButtonTestID: 'farms-tab',
          }}
        />
      )}

      {/* Cart Tab - Only for consumers */}
      {!isUserFarm() && (
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <View>
                <CartIcon color={color} />
                <CartBadge count={cartItemCount} />
              </View>
            ),
            tabBarButtonTestID: 'cart-tab',
          }}
        />
      )}

      {/* Orders Tab - For both consumers and farms */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
          tabBarButtonTestID: 'orders-tab',
          href: isUserFarm() ? '/(app)/farm/orders' : '/orders',
        }}
      />

      {/* Profile Tab - For all users */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />

      {/* Settings Tab - Hidden, accessible from profile */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* Hidden tabs - Keep for routing but hide from tab bar */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </>
  );
};

export default function TabLayout() {
  const { status, isFirstTime, shouldBypassLogin } = useAppInitialization();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  
  // If bypass login is enabled, don't redirect to login screen
  if (status === 'signOut' && !shouldBypassLogin) {
    return <Redirect href="/login" />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6', // Blue-600 for both modes
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF', // Gray-500 dark, Gray-400 light
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // Gray-800 dark, White light
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB', // Gray-700 dark, Gray-200 light
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <TabScreens />
    </Tabs>
  );
}

const CreateNewPostLink = () => {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
};
