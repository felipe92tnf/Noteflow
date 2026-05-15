import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Surface, Text, useTheme } from 'react-native-paper';

import { IDEA_COLOR_VALUES } from '../../constants/ideaColors';
import { spacing } from '../../constants/theme';
import type { IdeaNote } from '../../types';
import { formatNoteDate } from '../../utils/format';

type IdeaCardProps = {
  note: IdeaNote;
  onPress?: (note: IdeaNote) => void;
};

export function IdeaCard({ note, onPress }: IdeaCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(note)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: IDEA_COLOR_VALUES[note.color],
          },
        ]}
        elevation={1}
      >
        <Text variant="titleMedium" numberOfLines={1}>
          {note.title}
        </Text>
        {note.tags.length > 0 ? (
          <View style={styles.tags}>
            {note.tags.slice(0, 4).map((tag) => (
              <Chip key={tag} compact mode="outlined">
                {tag}
              </Chip>
            ))}
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
    borderLeftWidth: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
