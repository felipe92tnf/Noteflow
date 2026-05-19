import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { FlatList, Platform, type FlatListProps } from 'react-native';

import { withEstimatedItemSize } from './flashListEstimatedSize';

type VirtualizedListProps<T> = FlashListProps<T> & {
  estimatedItemSize: number;
};

/**
 * FlashList en iOS/Android; FlatList en web (mejor compatibilidad con RN Web y Vercel).
 */
export function VirtualizedList<T>({
  estimatedItemSize,
  ...props
}: VirtualizedListProps<T>) {
  if (Platform.OS === 'web') {
    const flatListProps = props as FlatListProps<T>;
    return <FlatList {...flatListProps} />;
  }

  return (
    <FlashList<T>
      {...withEstimatedItemSize<T>(estimatedItemSize)}
      {...props}
    />
  );
}
