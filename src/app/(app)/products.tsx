import React from 'react';
import { Redirect } from 'expo-router';

// This is a redirect screen that points to the actual products listing
export default function ProductsTabScreen() {
  return <Redirect href="/products" />;
}

