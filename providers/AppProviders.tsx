import '../utils/importMetaPolyfill';

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { getPaperTheme } from '../constants/theme';
import { useNotesStore } from '../store/notesStore';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const paperTheme = getPaperTheme(colorScheme);
  const initialize = useNotesStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}
