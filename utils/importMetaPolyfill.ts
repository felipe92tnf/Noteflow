import { Platform } from 'react-native';

declare global {
  // eslint-disable-next-line no-var
  var __ExpoImportMetaRegistry: { env: { MODE: string } } | undefined;
}

/**
 * Polyfill para `globalThis.__ExpoImportMetaRegistry` en web cuando Babel
 * transforma `import.meta` (p. ej. código de zustand/middleware).
 */
export function ensureImportMetaPolyfill(): void {
  if (Platform.OS !== 'web') {
    return;
  }

  if (globalThis.__ExpoImportMetaRegistry) {
    return;
  }

  const mode =
    typeof process !== 'undefined' && process.env?.NODE_ENV
      ? process.env.NODE_ENV
      : 'development';

  globalThis.__ExpoImportMetaRegistry = {
    env: { MODE: mode },
  };
}

ensureImportMetaPolyfill();
