import { create } from 'zustand';

import { mapUpdateInputToPayload, notesApi, toErrorMessage } from '../lib/api';
import type {
  AnyNote,
  ChecklistNote,
  CreateAnyNoteInput,
  IdeaNote,
  Note,
  NoteType,
  UpdateAnyNoteInput,
} from '../types';

import { readNotesCache, writeNotesCache } from './notesCache';
import {
  localArchive,
  localDelete,
  localUnarchive,
  optimisticUpdate,
  replaceNoteInState,
  toCacheSnapshot,
  upsertActiveNote,
} from './notesStoreHelpers';
import type { NotesStore } from './notesStoreTypes';

export { NOTES_STORAGE_KEY } from './notesStoreTypes';
export type { NotesStore, NotesStoreActions, NotesStoreState } from './notesStoreTypes';

let initializePromise: Promise<void> | null = null;

async function persistCacheFromStore(get: () => NotesStore): Promise<void> {
  await writeNotesCache(toCacheSnapshot(get()));
}

export const useNotesStore = create<NotesStore>()((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  archivedNotes: [],
  archivedChecklists: [],
  archivedIdeas: [],
  isLoading: false,
  error: null,
  _hasHydrated: false,

  initialize: async () => {
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const cached = await readNotesCache();
      if (cached) {
        set({
          ...cached,
          _hasHydrated: true,
        });
      }
      await get().loadNotes();
    })();

    return initializePromise;
  },

  loadNotes: async () => {
    set({ isLoading: true, error: null });

    try {
      const partition = await notesApi.fetchAll();
      set({
        ...partition,
        isLoading: false,
        error: null,
        _hasHydrated: true,
      });
      await persistCacheFromStore(get);
    } catch (error) {
      console.warn('[notesStore] loadNotes failed:', error);
      set({
        isLoading: false,
        error: toErrorMessage(error),
        _hasHydrated: true,
      });
    }
  },

  createNote: async (input: CreateAnyNoteInput) => {
    set({ error: null });

    try {
      const created = await notesApi.create(input);
      set((state) => ({
        ...upsertActiveNote(state, created),
        error: null,
      }));
      await persistCacheFromStore(get);
    } catch (error) {
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  updateNote: async (id: string, input: UpdateAnyNoteInput) => {
    const previous = get();
    set((state) => ({
      ...optimisticUpdate(state, id, input),
      error: null,
    }));

    try {
      const updated = await notesApi.update(id, mapUpdateInputToPayload(input));
      set((state) => ({
        ...replaceNoteInState(state, updated),
        error: null,
      }));
      await persistCacheFromStore(get);
    } catch (error) {
      set({
        notes: previous.notes,
        checklists: previous.checklists,
        ideas: previous.ideas,
        archivedNotes: previous.archivedNotes,
        archivedChecklists: previous.archivedChecklists,
        archivedIdeas: previous.archivedIdeas,
        error: toErrorMessage(error),
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    const previous = get();
    set((state) => ({
      ...localDelete(state, id),
      error: null,
    }));

    try {
      await notesApi.delete(id);
      await persistCacheFromStore(get);
    } catch (error) {
      set({
        notes: previous.notes,
        checklists: previous.checklists,
        ideas: previous.ideas,
        archivedNotes: previous.archivedNotes,
        archivedChecklists: previous.archivedChecklists,
        archivedIdeas: previous.archivedIdeas,
        error: toErrorMessage(error),
      });
      throw error;
    }
  },

  getNotesByType: (type: NoteType) => {
    const state = get();
    switch (type) {
      case 'note':
        return state.notes;
      case 'checklist':
        return state.checklists;
      case 'idea':
        return state.ideas;
    }
  },

  getNoteById: (id) => {
    const state = get();
    return (
      state.notes.find((note) => note.id === id) ??
      state.checklists.find((checklist) => checklist.id === id) ??
      state.ideas.find((idea) => idea.id === id) ??
      state.archivedNotes.find((note) => note.id === id) ??
      state.archivedChecklists.find((checklist) => checklist.id === id) ??
      state.archivedIdeas.find((idea) => idea.id === id)
    );
  },

  addNote: (note: Note) => {
    void get().createNote({
      type: 'note',
      title: note.title,
      content: note.content,
    });
  },

  addChecklist: (checklist: ChecklistNote) => {
    void get().createNote({
      type: 'checklist',
      title: checklist.title,
      items: checklist.items,
    });
  },

  addIdea: (idea: IdeaNote) => {
    void get().createNote({
      type: 'idea',
      title: idea.title,
      content: idea.content,
      tags: idea.tags,
      color: idea.color,
    });
  },

  toggleChecklistItem: (checklistId, itemId) => {
    const checklist = get().checklists.find((item) => item.id === checklistId);
    if (!checklist) {
      return;
    }

    const items = checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );

    void get().updateNote(checklistId, { items });
  },

  archiveNote: (id) => {
    const previous = get();
    set((state) => ({
      ...localArchive(state, id),
      error: null,
    }));

    void (async () => {
      try {
        await notesApi.update(id, { archived: true });
        await persistCacheFromStore(get);
      } catch (error) {
        set({
          notes: previous.notes,
          checklists: previous.checklists,
          ideas: previous.ideas,
          archivedNotes: previous.archivedNotes,
          archivedChecklists: previous.archivedChecklists,
          archivedIdeas: previous.archivedIdeas,
          error: toErrorMessage(error),
        });
      }
    })();
  },

  unarchiveNote: (id) => {
    const previous = get();
    set((state) => ({
      ...localUnarchive(state, id),
      error: null,
    }));

    void (async () => {
      try {
        await notesApi.update(id, { archived: false });
        await persistCacheFromStore(get);
      } catch (error) {
        set({
          notes: previous.notes,
          checklists: previous.checklists,
          ideas: previous.ideas,
          archivedNotes: previous.archivedNotes,
          archivedChecklists: previous.archivedChecklists,
          archivedIdeas: previous.archivedIdeas,
          error: toErrorMessage(error),
        });
      }
    })();
  },

  deleteChecklist: (id) => {
    void get().deleteNote(id);
  },

  deleteIdea: (id) => {
    void get().deleteNote(id);
  },

  resetNotes: () => {
    set({
      notes: [],
      checklists: [],
      ideas: [],
      archivedNotes: [],
      archivedChecklists: [],
      archivedIdeas: [],
      error: null,
    });
    void persistCacheFromStore(get);
  },

  setHasHydrated: (value) => set({ _hasHydrated: value }),

  clearError: () => set({ error: null }),
}));
