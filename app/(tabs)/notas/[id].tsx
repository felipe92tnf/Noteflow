import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import { isTextNote } from '../../../types';
import { formatCreatedDate } from '../../../utils/format';
import { confirmAction } from '../../../utils/confirmAction';
import { resolveParamId } from '../../../utils/resolveParamId';
import { impactMedium } from '../../../utils/safeHaptics';

export default function NotaDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = resolveParamId(id);

  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const getNoteById = useNotesStore((state) => state.getNoteById);
  const archiveNote = useNotesStore((state) => state.archiveNote);

  const note = useMemo(() => {
    const found = noteId ? getNoteById(noteId) : undefined;
    return found && isTextNote(found) ? found : undefined;
  }, [getNoteById, noteId]);

  const handleArchive = useCallback(async () => {
    if (!note) {
      return;
    }

    const confirmed = await confirmAction(
      'Archivar nota',
      `¿Archivar "${note.title}"? Podrás restaurarla desde Archivadas.`,
      'Archivar',
    );

    if (!confirmed) {
      return;
    }

    void impactMedium();
    archiveNote(note.id);
    router.back();
  }, [archiveNote, note, router]);

  if (!hasHydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Nota no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium">{note.title}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Creada: {formatCreatedDate(note.createdAt)}
      </Text>

      <Divider style={styles.divider} />

      <Text variant="bodyLarge" style={styles.body}>
        {note.content}
      </Text>

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
  divider: {
    marginVertical: spacing.md,
  },
  body: {
    lineHeight: 24,
  },
  archiveButton: {
    marginTop: spacing.xl,
  },
});
