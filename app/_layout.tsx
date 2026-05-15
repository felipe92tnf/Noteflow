import { Stack } from 'expo-router';

import { AppProviders } from '../providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="nueva-nota" options={{ title: 'Nueva nota' }} />
      </Stack>
    </AppProviders>
  );
}
