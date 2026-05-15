import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../constants/theme';

type ItemPlaceholderProps = {
  title?: string;
};

export function ItemPlaceholder({ title = 'Item' }: ItemPlaceholderProps) {
  const theme = useTheme();

  return (
    <Surface
      style={[styles.container, { borderColor: theme.colors.outline }]}
      elevation={0}
    >
      <Text variant="titleMedium">{title}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
});
