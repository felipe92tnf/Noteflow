import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { getPaperTheme } from '../constants/theme';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const paperTheme = getPaperTheme(colorScheme);

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}
