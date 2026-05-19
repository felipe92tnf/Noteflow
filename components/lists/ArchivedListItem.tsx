import { StyleSheet, View } from 'react-native';
import { Button, Chip, useTheme } from 'react-native-paper';

import { spacing } from '../../constants/theme';
import type { AnyNote } from '../../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../../types';
import { ChecklistCard, IdeaCard, NoteCard } from '../items';

const TYPE_LABELS = {
  note: 'Nota',
  checklist: 'Checklist',
  idea: 'Idea',
} as const;

type ArchivedListItemProps = {
  item: AnyNote;
  onRestore: () => void;
};

export function ArchivedListItem({ item, onRestore }: ArchivedListItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.badgeRow}>
        <Chip compact mode="flat" style={{ backgroundColor: theme.colors.surfaceVariant }}>
          {TYPE_LABELS[item.type]}
        </Chip>
      </View>
      {isTextNote(item) ? <NoteCard note={item} /> : null}
      {isChecklistNote(item) ? <ChecklistCard note={item} /> : null}
      {isIdeaNote(item) ? <IdeaCard note={item} /> : null}
      <Button mode="contained-tonal" icon="archive-arrow-up" onPress={onRestore}>
        Restaurar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
});
