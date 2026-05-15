import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Text, useTheme } from 'react-native-paper';

import { IDEA_COLOR_LABELS, IDEA_COLOR_VALUES } from '../../../constants/ideaColors';
import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import { formatCreatedDate } from '../../../utils/format';
import { resolveParamId } from '../../../utils/resolveParamId';

export default function IdeaDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ideaId = resolveParamId(id);

  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const ideas = useNotesStore((state) => state.ideas);
  const deleteIdea = useNotesStore((state) => state.deleteIdea);

  const idea = useMemo(
    () => (ideaId ? ideas.find((item) => item.id === ideaId) : undefined),
    [ideaId, ideas],
  );

  const colorValue = idea ? IDEA_COLOR_VALUES[idea.color] : undefined;

  const handleDelete = useCallback(() => {
    if (!idea) {
      return;
    }

    Alert.alert('Eliminar idea', `¿Seguro que quieres eliminar "${idea.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteIdea(idea.id);
          router.back();
        },
      },
    ]);
  }, [deleteIdea, idea, router]);

  if (!hasHydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!idea) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Idea no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.colorBanner,
          { backgroundColor: colorValue },
        ]}
      />
      <Text variant="headlineMedium" style={styles.title}>
        {idea.title}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Creada: {formatCreatedDate(idea.createdAt)}
      </Text>
      <View style={styles.colorRow}>
        <View style={[styles.colorDot, { backgroundColor: colorValue }]} />
        <Text variant="labelLarge">{IDEA_COLOR_LABELS[idea.color]}</Text>
      </View>

      <Divider style={styles.divider} />

      {idea.tags.length > 0 ? (
        <View style={styles.tags}>
          {idea.tags.map((tag) => (
            <Chip key={tag} mode="outlined">
              {tag}
            </Chip>
          ))}
        </View>
      ) : (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Sin etiquetas
        </Text>
      )}

      {idea.content.trim().length > 0 ? (
        <Text
          variant="bodyMedium"
          style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]}
        >
          {idea.content}
        </Text>
      ) : null}

      <Button
        mode="outlined"
        icon="delete"
        textColor={theme.colors.error}
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        Eliminar idea
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
  colorBanner: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  divider: {
    marginVertical: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  contentText: {
    marginTop: spacing.md,
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: spacing.xl,
    borderColor: 'transparent',
  },
});
