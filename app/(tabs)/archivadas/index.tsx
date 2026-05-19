import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

import { ArchivedListItem } from '../../../components/lists/ArchivedListItem';
import { getArchivedListEmptyState } from '../../../components/lists/archivedListConstants';
import { VirtualizedList } from '../../../components/lists/VirtualizedList';
import { EmptyState } from '../../../components/ui/EmptyState';
import { spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import type { AnyNote } from '../../../types';
import { mergeArchivedNotes } from '../../../utils/archivedNotes';
import { filterArchivedNotes } from '../../../utils/noteFilters';

export default function ArchivadasIndexScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const archivedNotes = useNotesStore((state) => state.archivedNotes);
  const archivedChecklists = useNotesStore((state) => state.archivedChecklists);
  const archivedIdeas = useNotesStore((state) => state.archivedIdeas);
  const unarchiveNote = useNotesStore((state) => state.unarchiveNote);

  const allArchived = useMemo(
    () => mergeArchivedNotes(archivedNotes, archivedChecklists, archivedIdeas),
    [archivedChecklists, archivedIdeas, archivedNotes],
  );

  const filteredArchived = useMemo(
    () => filterArchivedNotes(allArchived, searchQuery),
    [allArchived, searchQuery],
  );

  const emptyState = getArchivedListEmptyState(allArchived.length, searchQuery);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        mode="outlined"
        placeholder="Buscar archivadas..."
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
          <VirtualizedList<AnyNote>
            estimatedItemSize={180}
            data={filteredArchived}
            renderItem={({ item }) => (
              <ArchivedListItem item={item} onRestore={() => unarchiveNote(item.id)} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              filteredArchived.length === 0 ? styles.emptyList : styles.list
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
});
