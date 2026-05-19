import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';

import { useNotesStore } from '../../store/notesStore';
import { tabTitleWithCount } from '../../utils/tabTitle';

export default function TabsLayout() {
  const theme = useTheme();

  const notesCount = useNotesStore((state) => state.notes.length);
  const checklistsCount = useNotesStore((state) => state.checklists.length);
  const ideasCount = useNotesStore((state) => state.ideas.length);
  const archivedCount = useNotesStore(
    (state) =>
      state.archivedNotes.length +
      state.archivedChecklists.length +
      state.archivedIdeas.length,
  );

  const tabTitles = useMemo(
    () => ({
      notas: tabTitleWithCount('Notas', notesCount),
      checklists: tabTitleWithCount('Checklists', checklistsCount),
      ideas: tabTitleWithCount('Ideas', ideasCount),
      archivadas: tabTitleWithCount('Archivadas', archivedCount),
    }),
    [archivedCount, checklistsCount, ideasCount, notesCount],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="notas"
        options={{
          title: tabTitles.notas,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="note-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: tabTitles.checklists,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-checks" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: tabTitles.ideas,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="archivadas"
        options={{
          title: tabTitles.archivadas,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
