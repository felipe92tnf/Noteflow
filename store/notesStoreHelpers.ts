import type { AnyNote, ChecklistNote, IdeaNote, Note, UpdateAnyNoteInput } from '../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../types';

import type { CachedNotesState } from './notesCache';
import type { NotesStoreState } from './notesStoreTypes';

const createTimestamp = (): string => new Date().toISOString();

export function toCacheSnapshot(state: NotesStoreState): CachedNotesState {
  return {
    notes: state.notes,
    checklists: state.checklists,
    ideas: state.ideas,
    archivedNotes: state.archivedNotes,
    archivedChecklists: state.archivedChecklists,
    archivedIdeas: state.archivedIdeas,
  };
}

export function findNoteInState(state: NotesStoreState, id: string): AnyNote | undefined {
  return (
    state.notes.find((item) => item.id === id) ??
    state.checklists.find((item) => item.id === id) ??
    state.ideas.find((item) => item.id === id) ??
    state.archivedNotes.find((item) => item.id === id) ??
    state.archivedChecklists.find((item) => item.id === id) ??
    state.archivedIdeas.find((item) => item.id === id)
  );
}

export function stripNoteFromAllLists(
  state: NotesStoreState,
  id: string,
): Pick<
  NotesStoreState,
  'notes' | 'checklists' | 'ideas' | 'archivedNotes' | 'archivedChecklists' | 'archivedIdeas'
> {
  return {
    notes: state.notes.filter((item) => item.id !== id),
    checklists: state.checklists.filter((item) => item.id !== id),
    ideas: state.ideas.filter((item) => item.id !== id),
    archivedNotes: state.archivedNotes.filter((item) => item.id !== id),
    archivedChecklists: state.archivedChecklists.filter((item) => item.id !== id),
    archivedIdeas: state.archivedIdeas.filter((item) => item.id !== id),
  };
}

/** Coloca una nota en la lista activa o archivada según su tipo, sin duplicar por id. */
export function placeNoteInPartition(
  state: NotesStoreState,
  note: AnyNote,
  archived: boolean,
): Partial<NotesStoreState> {
  const stripped = stripNoteFromAllLists(state, note.id);

  if (isTextNote(note)) {
    return archived
      ? { ...stripped, archivedNotes: [note, ...stripped.archivedNotes] }
      : { ...stripped, notes: [note, ...stripped.notes] };
  }

  if (isChecklistNote(note)) {
    return archived
      ? { ...stripped, archivedChecklists: [note, ...stripped.archivedChecklists] }
      : { ...stripped, checklists: [note, ...stripped.checklists] };
  }

  if (isIdeaNote(note)) {
    return archived
      ? { ...stripped, archivedIdeas: [note, ...stripped.archivedIdeas] }
      : { ...stripped, ideas: [note, ...stripped.ideas] };
  }

  return stripped;
}

export function applyTextNoteUpdate(note: Note, input: UpdateAnyNoteInput): Note {
  return {
    ...note,
    title: input.title ?? note.title,
    content: input.content ?? note.content,
    updatedAt: createTimestamp(),
  };
}

export function applyChecklistUpdate(
  checklist: ChecklistNote,
  input: UpdateAnyNoteInput,
): ChecklistNote {
  return {
    ...checklist,
    title: input.title ?? checklist.title,
    items: input.items ?? checklist.items,
    updatedAt: createTimestamp(),
  };
}

export function applyIdeaUpdate(idea: IdeaNote, input: UpdateAnyNoteInput): IdeaNote {
  return {
    ...idea,
    title: input.title ?? idea.title,
    content: input.content ?? idea.content,
    tags: input.tags ?? idea.tags,
    color: input.color ?? idea.color,
    updatedAt: createTimestamp(),
  };
}

export function upsertActiveNote(state: NotesStoreState, note: AnyNote): Partial<NotesStoreState> {
  return placeNoteInPartition(state, note, false);
}

export function replaceNoteInState(
  state: NotesStoreState,
  note: AnyNote,
  archived = false,
): Partial<NotesStoreState> {
  return placeNoteInPartition(state, note, archived);
}

export function optimisticUpdate(
  state: NotesStoreState,
  id: string,
  input: UpdateAnyNoteInput,
): Partial<NotesStoreState> {
  return {
    notes: state.notes.map((note) =>
      note.id === id ? applyTextNoteUpdate(note, input) : note,
    ),
    checklists: state.checklists.map((checklist) =>
      checklist.id === id ? applyChecklistUpdate(checklist, input) : checklist,
    ),
    ideas: state.ideas.map((idea) => (idea.id === id ? applyIdeaUpdate(idea, input) : idea)),
  };
}

export function localArchive(state: NotesStoreState, id: string): Partial<NotesStoreState> {
  const note = findNoteInState(state, id);
  if (!note) {
    return {};
  }

  return placeNoteInPartition(state, { ...note, updatedAt: createTimestamp() }, true);
}

export function localUnarchive(state: NotesStoreState, id: string): Partial<NotesStoreState> {
  const note = findNoteInState(state, id);
  if (!note) {
    return {};
  }

  return placeNoteInPartition(state, { ...note, updatedAt: createTimestamp() }, false);
}

export function localDelete(state: NotesStoreState, id: string): Partial<NotesStoreState> {
  return stripNoteFromAllLists(state, id);
}
