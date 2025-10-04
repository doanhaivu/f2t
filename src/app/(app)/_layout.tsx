/* eslint-disable react/no-unstable-nested-components */
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { Pressable, Text } from '@/components/ui';
import {
  Farm as FarmIcon,
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime, useDeveloperMode } from '@/lib';

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

// Tab screens configuration
const TabScreens = () => (
  <>
    <Tabs.Screen
      name="index"
      options={{
        title: 'Feed',
        tabBarIcon: ({ color }) => <FeedIcon color={color} />,
        headerRight: () => <CreateNewPostLink />,
        tabBarButtonTestID: 'feed-tab',
      }}
    />

    <Tabs.Screen
      name="farms"
      options={{
        title: 'Farms',
        headerShown: false,
        tabBarIcon: ({ color }) => <FarmIcon color={color} />,
        tabBarButtonTestID: 'farms-tab',
      }}
    />

    <Tabs.Screen
      name="style"
      options={{
        title: 'Style',
        headerShown: false,
        tabBarIcon: ({ color }) => <StyleIcon color={color} />,
        tabBarButtonTestID: 'style-tab',
      }}
    />
    <Tabs.Screen
      name="settings"
      options={{
        title: 'Settings',
        headerShown: false,
        tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        tabBarButtonTestID: 'settings-tab',
      }}
    />
  </>
);

export default function TabLayout() {
  const { status, isFirstTime, shouldBypassLogin } = useAppInitialization();

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  
  // If bypass login is enabled, don't redirect to login screen
  if (status === 'signOut' && !shouldBypassLogin) {
    return <Redirect href="/login" />;
  }
  
  return (
    <Tabs>
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
