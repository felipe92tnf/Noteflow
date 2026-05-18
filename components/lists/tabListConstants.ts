import type { NoteType } from '../../types';

export const TAB_ROUTES: Record<NoteType, string> = {
  note: '/(tabs)/notas',
  checklist: '/(tabs)/checklists',
  idea: '/(tabs)/ideas',
};

type EmptyStateConfig = {
  icon: 'note-text-outline' | 'format-list-checks' | 'lightbulb-outline' | 'magnify';
  title: string;
  description: string;
};

const EMPTY_STATE_CONFIG: Record<NoteType, EmptyStateConfig> = {
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

const NO_RESULTS_DESCRIPTION = 'Prueba con otros términos de búsqueda.';

export function getListEmptyState(
  type: NoteType,
  totalCount: number,
  searchQuery: string,
): EmptyStateConfig | null {
  if (totalCount === 0) {
    return EMPTY_STATE_CONFIG[type];
  }

  if (searchQuery.trim().length > 0) {
    return {
      icon: 'magnify',
      title: 'No se encontraron resultados',
      description: NO_RESULTS_DESCRIPTION,
    };
  }

  return null;
}
