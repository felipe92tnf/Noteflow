import { Alert, Platform } from 'react-native';

/**
 * Confirmación multiplataforma. En web `Alert.alert` no muestra diálogo fiable;
 * usamos `window.confirm` para que Archivar/Eliminar funcionen en Expo Web.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'Confirmar',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof globalThis.confirm !== 'function') {
      return Promise.resolve(true);
    }
    return Promise.resolve(globalThis.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ]);
  });
}
