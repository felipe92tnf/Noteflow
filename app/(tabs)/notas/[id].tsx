import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import { formatCreatedDate } from '../../../utils/format';
import { resolveParamId } from '../../../utils/resolveParamId';
import { impactMedium } from '../../../utils/safeHaptics';

export default function NotaDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = resolveParamId(id);

  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const notes = useNotesStore((state) => state.notes);
  const archiveNote = useNotesStore((state) => state.archiveNote);

  const note = useMemo(
    () => (noteId ? notes.find((item) => item.id === noteId) : undefined),
    [noteId, notes],
  );

  const handleArchive = useCallback(() => {
    if (!note) {
      return;
    }

    Alert.alert('Archivar nota', `¿Archivar "${note.title}"? Podrás restaurarla desde Archivadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: () => {
          void impactMedium();
          archiveNote(note.id);
          router.back();
        },
      },
    ]);
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
