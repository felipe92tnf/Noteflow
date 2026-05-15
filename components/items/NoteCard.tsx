import { Pressable, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../constants/theme';
import type { TextNote } from '../../types';
import { formatNoteDate, truncate } from '../../utils/format';

type NoteCardProps = {
  note: TextNote;
  onPress?: (note: TextNote) => void;
};

export function NoteCard({ note, onPress }: NoteCardProps) {
  const theme = useTheme();

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
        {note.content.trim().length > 0 ? (
          <Text
            variant="bodyMedium"
            numberOfLines={2}
            style={[styles.preview, { color: theme.colors.onSurfaceVariant }]}
          >
            {truncate(note.content, 120)}
          </Text>
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
  preview: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
