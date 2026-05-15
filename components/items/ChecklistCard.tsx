import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../constants/theme';
import type { ChecklistNote } from '../../types';
import { formatNoteDate } from '../../utils/format';

type ChecklistCardProps = {
  note: ChecklistNote;
  onPress?: (note: ChecklistNote) => void;
};

export function ChecklistCard({ note, onPress }: ChecklistCardProps) {
  const theme = useTheme();
  const completed = note.items.filter((item) => item.completed).length;
  const total = note.items.length;
  const previewItems = note.items.slice(0, 3);

  return (
    <Pressable
      onPress={() => onPress?.(note)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <Text variant="titleMedium" numberOfLines={1}>
          {note.title}
        </Text>
        <Text variant="labelMedium" style={[styles.progress, { color: theme.colors.primary }]}>
          {total === 0 ? 'Sin tareas' : `${completed} de ${total} completadas`}
        </Text>
        {previewItems.length > 0 ? (
          <View style={styles.items}>
            {previewItems.map((item) => (
              <Text
                key={item.id}
                variant="bodySmall"
                numberOfLines={1}
                style={{
                  color: item.completed
                    ? theme.colors.onSurfaceVariant
                    : theme.colors.onSurface,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                }}
              >
                {item.completed ? '✓ ' : '○ '}
                {item.text}
              </Text>
            ))}
            {note.items.length > previewItems.length ? (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                +{note.items.length - previewItems.length} más
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatNoteDate(note.updatedAt)}
        </Text>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  progress: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  items: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
