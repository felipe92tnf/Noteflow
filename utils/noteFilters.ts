import type { AnyNote, ChecklistNote, IdeaNote, NoteType, TextNote } from '../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../types';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterTextNotes(notes: readonly AnyNote[], query: string): TextNote[] {
  const normalized = normalizeQuery(query);
  const textNotes = notes.filter(isTextNote);

  if (!normalized) {
    return textNotes;
  }

  return textNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(normalized) ||
      note.content.toLowerCase().includes(normalized),
  );
}

export function filterChecklistNotes(
  notes: readonly AnyNote[],
  query: string,
): ChecklistNote[] {
  const normalized = normalizeQuery(query);
  const checklists = notes.filter(isChecklistNote);

  if (!normalized) {
    return checklists;
  }

  return checklists.filter(
    (note) =>
      note.title.toLowerCase().includes(normalized) ||
      note.items.some((item) => item.text.toLowerCase().includes(normalized)),
  );
}

export function filterIdeaNotes(notes: readonly AnyNote[], query: string): IdeaNote[] {
  const normalized = normalizeQuery(query);
  const ideas = notes.filter(isIdeaNote);

  if (!normalized) {
    return ideas;
  }

  return ideas.filter(
    (note) =>
      note.title.toLowerCase().includes(normalized) ||
      note.tags.some((tag) => tag.toLowerCase().includes(normalized)),
  );
}

export function filterNotesByType(
  notes: readonly AnyNote[],
  type: NoteType,
  query: string,
): AnyNote[] {
  switch (type) {
    case 'note':
      return filterTextNotes(notes, query);
    case 'checklist':
      return filterChecklistNotes(notes, query);
    case 'idea':
      return filterIdeaNotes(notes, query);
  }
}
