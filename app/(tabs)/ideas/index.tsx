import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { FAB, TextInput, useTheme } from 'react-native-paper';

import { NoteListItem } from '../../../components/lists/NoteListItem';
import { VirtualizedList } from '../../../components/lists/VirtualizedList';
import { getListEmptyState, TAB_ROUTES } from '../../../components/lists/tabListConstants';
import { EmptyState } from '../../../components/ui/EmptyState';
import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import type { IdeaNote } from '../../../types';
import { filterIdeaNotes } from '../../../utils/noteFilters';

export default function IdeasIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const allNotes = useNotesStore((state) => state.getNotesByType('idea'));

  const filteredNotes = useMemo(
    () => filterIdeaNotes(allNotes, searchQuery),
    [allNotes, searchQuery],
  );

  const emptyState = getListEmptyState('idea', allNotes.length, searchQuery);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        mode="outlined"
        placeholder="Buscar ideas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
        right={
          searchQuery.length > 0 ? (
            <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} />
          ) : undefined
        }
      />
      <View style={styles.listWrapper}>
        {!hasHydrated ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
        <VirtualizedList<IdeaNote>
          estimatedItemSize={140}
          data={filteredNotes}
          renderItem={({ item }) => (
            <NoteListItem
              item={item}
              onPress={() => router.push(`${TAB_ROUTES.idea}/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            filteredNotes.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            emptyState ? (
              <EmptyState
                icon={emptyState.icon}
                title={emptyState.title}
                description={emptyState.description}
              />
            ) : null
          }
        />
        )}
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/nueva-nota')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listWrapper: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
