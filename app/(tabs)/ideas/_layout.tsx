import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function IdeasLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Ideas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Idea' }} />
    </Stack>
  );
}
