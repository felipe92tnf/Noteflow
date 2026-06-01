import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import { confirmAction } from '../../../utils/confirmAction';
import { formatNoteDate } from '../../../utils/format';
import { impactLight, notificationSuccess } from '../../../utils/safeHaptics';

function resolveParamId(id: string | string[] | undefined): string | undefined {
  if (typeof id === 'string') {
    return id;
  }
  if (Array.isArray(id)) {
    return id[0];
  }
  return undefined;
}

export default function ChecklistDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklistId = resolveParamId(id);

  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const getNoteById = useNotesStore((state) => state.getNoteById);
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);
  const archiveNote = useNotesStore((state) => state.archiveNote);

  const checklist = useMemo(() => {
    const found = checklistId ? getNoteById(checklistId) : undefined;
    return found?.type === 'checklist' ? found : undefined;
  }, [checklistId, getNoteById]);

  const completedCount = checklist?.items.filter((item) => item.completed).length ?? 0;
  const totalCount = checklist?.items.length ?? 0;

  const handleToggleItem = useCallback(
    (itemId: string) => {
      if (!checklistId) {
        return;
      }
      void impactLight();
      toggleChecklistItem(checklistId, itemId);
    },
    [checklistId, toggleChecklistItem],
  );

  const handleArchive = useCallback(async () => {
    if (!checklist) {
      return;
    }

    const confirmed = await confirmAction(
      'Archivar checklist',
      `¿Archivar "${checklist.title}"? Podrás restaurarla desde Archivadas.`,
      'Archivar',
    );

    if (!confirmed) {
      return;
    }

    void notificationSuccess();
    archiveNote(checklist.id);
    router.back();
  }, [archiveNote, checklist, router]);

  if (!hasHydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!checklist) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Checklist no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium">{checklist.title}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Actualizada: {formatNoteDate(checklist.updatedAt)}
      </Text>
      <Text variant="titleSmall" style={styles.progress}>
        {totalCount === 0
          ? 'Sin tareas'
          : `${completedCount} de ${totalCount} completadas`}
      </Text>

      <Divider style={styles.divider} />

      {checklist.items.length === 0 ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Esta checklist no tiene ítems.
        </Text>
      ) : (
        checklist.items.map((item) => (
          <Checkbox.Item
            key={item.id}
            label={item.text}
            status={item.completed ? 'checked' : 'unchecked'}
            onPress={() => handleToggleItem(item.id)}
            labelStyle={
              item.completed
                ? [styles.itemLabel, styles.itemCompleted, { color: theme.colors.onSurfaceVariant }]
                : styles.itemLabel
            }
            style={styles.checkboxItem}
          />
        ))
      )}

      <Button
        mode="outlined"
        icon="archive-arrow-down"
        style={styles.archiveButton}
        onPress={handleArchive}
      >
        Archivar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  progress: {
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  checkboxItem: {
    paddingLeft: 0,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemCompleted: {
    textDecorationLine: 'line-through',
  },
  archiveButton: {
    marginTop: spacing.xl,
  },
});
