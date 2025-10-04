import { Redirect } from 'expo-router';

// This redirects /farms to /farms/index for the discovery screen
export default function FarmsRedirect() {
  return <Redirect href="/farms/" />;
}
