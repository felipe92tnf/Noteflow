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
  if (isTextNote(note)) {
    const notes = [note, ...state.notes.filter((item) => item.id !== note.id)];
    return { notes };
  }

  if (isChecklistNote(note)) {
    const checklists = [note, ...state.checklists.filter((item) => item.id !== note.id)];
    return { checklists };
  }

  if (isIdeaNote(note)) {
    const ideas = [note, ...state.ideas.filter((item) => item.id !== note.id)];
    return { ideas };
  }

  return {};
}

export function replaceNoteInState(
  state: NotesStoreState,
  note: AnyNote,
): Partial<NotesStoreState> {
  const removeId = <T extends { id: string }>(list: T[]) =>
    list.filter((item) => item.id !== note.id);

  const next: Partial<NotesStoreState> = {
    notes: removeId(state.notes),
    checklists: removeId(state.checklists),
    ideas: removeId(state.ideas),
    archivedNotes: removeId(state.archivedNotes),
    archivedChecklists: removeId(state.archivedChecklists),
    archivedIdeas: removeId(state.archivedIdeas),
  };

  if (isTextNote(note)) {
    next.notes = [note, ...(next.notes ?? [])];
  } else if (isChecklistNote(note)) {
    next.checklists = [note, ...(next.checklists ?? [])];
  } else if (isIdeaNote(note)) {
    next.ideas = [note, ...(next.ideas ?? [])];
  }

  return next;
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
  const note = state.notes.find((item) => item.id === id);
  if (note) {
    const archived = { ...note, updatedAt: createTimestamp() };
    return {
      notes: state.notes.filter((item) => item.id !== id),
      archivedNotes: [archived, ...state.archivedNotes],
    };
  }

  const checklist = state.checklists.find((item) => item.id === id);
  if (checklist) {
    const archived = { ...checklist, updatedAt: createTimestamp() };
    return {
      checklists: state.checklists.filter((item) => item.id !== id),
      archivedChecklists: [archived, ...state.archivedChecklists],
    };
  }

  const idea = state.ideas.find((item) => item.id === id);
  if (idea) {
    const archived = { ...idea, updatedAt: createTimestamp() };
    return {
      ideas: state.ideas.filter((item) => item.id !== id),
      archivedIdeas: [archived, ...state.archivedIdeas],
    };
  }

  return {};
}

export function localUnarchive(state: NotesStoreState, id: string): Partial<NotesStoreState> {
  const note = state.archivedNotes.find((item) => item.id === id);
  if (note) {
    const restored = { ...note, updatedAt: createTimestamp() };
    return {
      archivedNotes: state.archivedNotes.filter((item) => item.id !== id),
      notes: [restored, ...state.notes],
    };
  }

  const checklist = state.archivedChecklists.find((item) => item.id === id);
  if (checklist) {
    const restored = { ...checklist, updatedAt: createTimestamp() };
    return {
      archivedChecklists: state.archivedChecklists.filter((item) => item.id !== id),
      checklists: [restored, ...state.checklists],
    };
  }

  const idea = state.archivedIdeas.find((item) => item.id === id);
  if (idea) {
    const restored = { ...idea, updatedAt: createTimestamp() };
    return {
      archivedIdeas: state.archivedIdeas.filter((item) => item.id !== id),
      ideas: [restored, ...state.ideas],
    };
  }

  return {};
}

export function localDelete(state: NotesStoreState, id: string): Partial<NotesStoreState> {
  return {
    notes: state.notes.filter((note) => note.id !== id),
    checklists: state.checklists.filter((checklist) => checklist.id !== id),
    ideas: state.ideas.filter((idea) => idea.id !== id),
    archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
    archivedChecklists: state.archivedChecklists.filter((checklist) => checklist.id !== id),
    archivedIdeas: state.archivedIdeas.filter((idea) => idea.id !== id),
  };
}
