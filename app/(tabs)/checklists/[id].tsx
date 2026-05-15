import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import { formatNoteDate } from '../../../utils/format';

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
  const checklists = useNotesStore((state) => state.checklists);
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);
  const deleteChecklist = useNotesStore((state) => state.deleteChecklist);

  const checklist = useMemo(
    () => (checklistId ? checklists.find((item) => item.id === checklistId) : undefined),
    [checklistId, checklists],
  );

  const completedCount = checklist?.items.filter((item) => item.completed).length ?? 0;
  const totalCount = checklist?.items.length ?? 0;

  const handleToggleItem = useCallback(
    (itemId: string) => {
      if (!checklistId) {
        return;
      }
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleChecklistItem(checklistId, itemId);
    },
    [checklistId, toggleChecklistItem],
  );

  const handleDelete = useCallback(() => {
    if (!checklist) {
      return;
    }

    Alert.alert(
      'Eliminar checklist',
      `¿Seguro que quieres eliminar "${checklist.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteChecklist(checklist.id);
            router.back();
          },
        },
      ],
    );
  }, [checklist, deleteChecklist, router]);

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
        icon="delete"
        textColor={theme.colors.error}
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        Eliminar checklist
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
  deleteButton: {
    marginTop: spacing.xl,
    borderColor: 'transparent',
  },
});
