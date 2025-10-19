import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Settings as SettingsIcon,
  LogOut,
  ShoppingBag,
  Package,
  TrendingUp,
  Award,
  Store,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react-native';

import { Text, View, Button } from '@/components/ui';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';

export default function ProfileScreen() {
  const router = useRouter();
  const signOut = useAuth.use.signOut();
  const user = useAuth.use.user();
  const isFarm = useAuth.use.isFarm();
  const farm = useAuth.use.farm();
  
  const isUserFarm = isFarm();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => signOut() 
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // Mock stats - in real app, these would come from API
  const consumerStats = {
    totalOrders: 24,
    totalSpent: 1250.50,
    favoriteProducts: 12,
    memberSince: '2024',
  };

  const farmStats = {
    totalProducts: 45,
    totalOrders: 156,
    totalRevenue: 8450.75,
    rating: 4.8,
    reviews: 89,
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      
      <ScrollView className="flex-1">
        {/* Header with gradient background */}
        <View className="bg-primary px-4 pb-20 pt-16">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">
              Profile
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={handleSettings}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              >
                <SettingsIcon size={20} className="text-white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              >
                <LogOut size={20} className="text-white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Card - Overlapping header */}
        <View className="-mt-16 px-4">
          <View className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            {/* Avatar and basic info */}
            <View className="items-center">
              <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <User size={48} className="text-gray-500 dark:text-gray-400" />
              </View>
              
              <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                {user ? `${user.firstName} ${user.lastName}` : 'User Name'}
              </Text>
              
              <View className="mb-4 rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/20">
                <Text className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {isUserFarm ? '🌾 Farm Owner' : '🛒 Consumer'}
                </Text>
              </View>

              <Button
                label="Edit Profile"
                onPress={handleEditProfile}
                variant="outline"
                size="sm"
                className="mb-4"
              />
            </View>

            {/* Contact Information */}
            <View className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <View className="flex-row items-center">
                <Mail size={20} className="text-gray-500 dark:text-gray-400" />
                <Text className="ml-3 text-gray-700 dark:text-gray-300">
                  {user?.email || 'email@example.com'}
                </Text>
              </View>
              
              {user?.phoneNumber && (
                <View className="flex-row items-center">
                  <Phone size={20} className="text-gray-500 dark:text-gray-400" />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">
                    {user.phoneNumber}
                  </Text>
                </View>
              )}
              
              {user?.location?.address && (
                <View className="flex-row items-start">
                  <MapPin size={20} className="mt-0.5 text-gray-500 dark:text-gray-400" />
                  <Text className="ml-3 flex-1 text-gray-700 dark:text-gray-300">
                    {user.location.address.formattedAddress || 
                     `${user.location.address.street}, ${user.location.address.city}, ${user.location.address.state}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Role-Specific Content */}
        <View className="mt-6 px-4">
          {isUserFarm ? (
            // Farm Owner Stats
            <>
              <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                Farm Statistics
              </Text>
              
              {/* Farm Info Card */}
              {farm && (
                <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <View className="mb-3 flex-row items-center">
                    <Store size={24} className="text-primary" />
                    <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                      {farm.name}
                    </Text>
                  </View>
                  {farm.description && (
                    <Text className="mb-2 text-gray-600 dark:text-gray-400">
                      {farm.description}
                    </Text>
                  )}
                  <Button
                    label="Manage Farm"
                    onPress={() => router.push('/farm/profile')}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}

              {/* Stats Grid */}
              <View className="mb-4 flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <Package size={24} className="mb-2 text-blue-600 dark:text-blue-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {farmStats.totalProducts}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Products
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <ShoppingBag size={24} className="mb-2 text-green-600 dark:text-green-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {farmStats.totalOrders}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Orders
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <DollarSign size={24} className="mb-2 text-yellow-600 dark:text-yellow-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${farmStats.totalRevenue.toFixed(0)}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <Award size={24} className="mb-2 text-purple-600 dark:text-purple-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {farmStats.rating} ⭐
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Rating ({farmStats.reviews})
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </Text>
                <View className="space-y-2">
                  <TouchableOpacity
                    onPress={() => router.push('/products/add')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <Package size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      Add New Product
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/farm/orders')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      Manage Orders
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/inventory')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <TrendingUp size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      View Analytics
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            // Consumer Stats
            <>
              <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                Your Activity
              </Text>
              
              {/* Stats Grid */}
              <View className="mb-4 flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <ShoppingBag size={24} className="mb-2 text-blue-600 dark:text-blue-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consumerStats.totalOrders}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Total Orders
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <DollarSign size={24} className="mb-2 text-green-600 dark:text-green-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${consumerStats.totalSpent.toFixed(0)}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Total Spent
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <Award size={24} className="mb-2 text-purple-600 dark:text-purple-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consumerStats.favoriteProducts}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Favorites
                  </Text>
                </View>

                <View className="flex-1 min-w-[45%] rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <Calendar size={24} className="mb-2 text-orange-600 dark:text-orange-400" />
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consumerStats.memberSince}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </Text>
                <View className="space-y-2">
                  <TouchableOpacity
                    onPress={() => router.push('/orders')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      View Orders
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/products')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <Package size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      Browse Products
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/farms')}
                    className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <Store size={20} className="text-gray-700 dark:text-gray-300" />
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      Discover Farms
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

