import type { AnyNote, ChecklistNote, IdeaNote, Note } from '../types';

export function mergeArchivedNotes(
  archivedNotes: readonly Note[],
  archivedChecklists: readonly ChecklistNote[],
  archivedIdeas: readonly IdeaNote[],
): AnyNote[] {
  return [...archivedNotes, ...archivedChecklists, ...archivedIdeas].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
