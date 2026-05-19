import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

function isClientStorageAvailable(): boolean {
  return typeof window !== 'undefined';
}

/**
 * AsyncStorage en cliente (Expo Go / web). En SSR estático (export web) no hay
 * `window`; se devuelve null para que Zustand use el estado inicial.
 */
export const notesStateStorage: StateStorage = {
  getItem: async (name) => {
    if (!isClientStorageAvailable()) {
      return null;
    }

    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.warn('[notesStateStorage] getItem failed:', error);
      return null;
    }
  },
  setItem: async (name, value) => {
    if (!isClientStorageAvailable()) {
      return;
    }

    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.warn('[notesStateStorage] setItem failed:', error);
    }
  },
  removeItem: async (name) => {
    if (!isClientStorageAvailable()) {
      return;
    }

    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn('[notesStateStorage] removeItem failed:', error);
    }
  },
};
