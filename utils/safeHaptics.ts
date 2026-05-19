import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function impactLight(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function impactMedium(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function notificationSuccess(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
