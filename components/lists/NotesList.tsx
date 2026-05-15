import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { spacing } from '../../constants/theme';
import { useNotesStore } from '../../store/notesStore';
import type { AnyNote, NoteType } from '../../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../../types';
import { ChecklistCard, IdeaCard, NoteCard } from '../items';
import { EmptyState } from '../ui/EmptyState';

const TAB_ROUTES: Record<NoteType, string> = {
  note: '/(tabs)/notas',
  checklist: '/(tabs)/checklists',
  idea: '/(tabs)/ideas',
};

const EMPTY_STATE_CONFIG: Record<
  NoteType,
  {
    icon: 'note-text-outline' | 'format-list-checks' | 'lightbulb-outline';
    title: string;
    description: string;
  }
> = {
  note: {
    icon: 'note-text-outline',
    title: 'No hay notas',
    description: 'Crea tu primera nota para empezar a escribir.',
  },
  checklist: {
    icon: 'format-list-checks',
    title: 'No hay checklists',
    description: 'Organiza tus tareas en una nueva checklist.',
  },
  idea: {
    icon: 'lightbulb-outline',
    title: 'No hay ideas',
    description: 'Guarda tus ideas antes de que se te olviden.',
  },
};

type NotesListProps = {
  type: NoteType;
};

export function NotesList({ type }: NotesListProps) {
  const theme = useTheme();
  const router = useRouter();
  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const notes = useNotesStore((state) => state.getNotesByType(type));
  const emptyConfig = EMPTY_STATE_CONFIG[type];

  const handlePress = (id: string) => {
    router.push(`${TAB_ROUTES[type]}/${id}`);
  };

  const renderItem = ({ item }: { item: AnyNote }) => {
    if (isTextNote(item)) {
      return <NoteCard note={item} onPress={() => handlePress(item.id)} />;
    }
    if (isChecklistNote(item)) {
      return <ChecklistCard note={item} onPress={() => handlePress(item.id)} />;
    }
    if (isIdeaNote(item)) {
      return <IdeaCard note={item} onPress={() => handlePress(item.id)} />;
    }
    return null;
  };

  if (!hasHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlashList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={emptyConfig.icon}
            title={emptyConfig.title}
            description={emptyConfig.description}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
