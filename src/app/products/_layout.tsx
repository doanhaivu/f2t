import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Products',
          headerShown: false, // We'll handle the header in the component
          headerBackVisible: false, // No back button when accessed from bottom tab
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Add Product',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Product Details',
        }} 
      />
    </Stack>
  );
}
