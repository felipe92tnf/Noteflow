import type { FlashListProps } from '@shopify/flash-list';

/** FlashList v2 omits estimatedItemSize in typings; still passed for sizing hints. */
export function withEstimatedItemSize<T>(
  estimatedItemSize: number,
): Pick<FlashListProps<T>, never> & { estimatedItemSize: number } {
  return { estimatedItemSize };
}
