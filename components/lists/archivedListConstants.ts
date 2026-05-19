type ArchivedEmptyStateConfig = {
  icon: 'archive-outline' | 'magnify';
  title: string;
  description: string;
};

const EMPTY_ARCHIVED: ArchivedEmptyStateConfig = {
  icon: 'archive-outline',
  title: 'No hay elementos archivados',
  description: 'Los elementos archivados desde Notas, Checklists o Ideas aparecerán aquí.',
};

const NO_RESULTS_DESCRIPTION = 'Prueba con otros términos de búsqueda.';

export function getArchivedListEmptyState(
  totalCount: number,
  searchQuery: string,
): ArchivedEmptyStateConfig | null {
  if (totalCount === 0) {
    return EMPTY_ARCHIVED;
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
