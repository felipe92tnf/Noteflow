import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { notesStateStorage } from '../utils/storage';

import type {
  AnyNote,
  ChecklistNote,
  IdeaNote,
  Note,
  NoteType,
  UpdateAnyNoteInput,
} from '../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../types';

export const NOTES_STORAGE_KEY = 'noteflow-notes';

export interface NotesStoreState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  archivedNotes: Note[];
  archivedChecklists: ChecklistNote[];
  archivedIdeas: IdeaNote[];
  _hasHydrated: boolean;
}

export interface NotesStoreActions {
  getNotesByType: (type: NoteType) => AnyNote[];
  getNoteById: (id: string) => AnyNote | undefined;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  updateNote: (id: string, input: UpdateAnyNoteInput) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteIdea: (id: string) => void;
  resetNotes: () => void;
  setHasHydrated: (value: boolean) => void;
}

export type NotesStore = NotesStoreState & NotesStoreActions;

type PersistedNotesState = Pick<
  NotesStoreState,
  | 'notes'
  | 'checklists'
  | 'ideas'
  | 'archivedNotes'
  | 'archivedChecklists'
  | 'archivedIdeas'
>;

type LegacyPersistedState = {
  notes?: unknown[];
};

type LegacyNote = {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  checklistItems?: ChecklistNote['items'];
  createdAt: string;
  updatedAt: string;
};

const createTimestamp = (): string => new Date().toISOString();

const EMPTY_ARCHIVED: Pick<
  PersistedNotesState,
  'archivedNotes' | 'archivedChecklists' | 'archivedIdeas'
> = {
  archivedNotes: [],
  archivedChecklists: [],
  archivedIdeas: [],
};

function isLegacyNote(note: unknown): note is LegacyNote {
  return (
    typeof note === 'object' &&
    note !== null &&
    'type' in note &&
    'title' in note &&
    'id' in note
  );
}

function isPersistedAnyNote(note: LegacyNote | AnyNote): note is AnyNote {
  if (note.type === 'checklist') {
    return 'items' in note && Array.isArray(note.items);
  }

  if (note.type === 'idea') {
    return (
      'tags' in note &&
      Array.isArray(note.tags) &&
      'color' in note &&
      typeof note.color === 'string'
    );
  }

  return note.type === 'note' && 'content' in note && typeof note.content === 'string';
}

function migrateLegacyNote(note: LegacyNote | AnyNote): AnyNote {
  if (isPersistedAnyNote(note)) {
    return note;
  }

  if (note.type === 'checklist') {
    const legacy = note as LegacyNote;
    return {
      id: legacy.id,
      title: legacy.title,
      type: 'checklist',
      items: legacy.checklistItems ?? [],
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    };
  }

  if (note.type === 'note') {
    const legacy = note as LegacyNote;
    return {
      id: legacy.id,
      title: legacy.title,
      type: 'note',
      content: legacy.content,
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    };
  }

  const legacy = note as LegacyNote;
  return {
    id: legacy.id,
    title: legacy.title,
    type: 'idea',
    content: legacy.content,
    tags: [],
    color: 'blue',
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

function migratePersistedNotes(notes: unknown): AnyNote[] {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes.filter(isLegacyNote).map((note) => migrateLegacyNote(note));
}

function splitNotesByType(allNotes: AnyNote[]): Pick<PersistedNotesState, 'notes' | 'checklists' | 'ideas'> {
  return {
    notes: allNotes.filter(isTextNote),
    checklists: allNotes.filter(isChecklistNote),
    ideas: allNotes.filter(isIdeaNote),
  };
}

function applyTextNoteUpdate(note: Note, input: UpdateAnyNoteInput): Note {
  return {
    ...note,
    title: input.title ?? note.title,
    content: input.content ?? note.content,
    updatedAt: createTimestamp(),
  };
}

function applyChecklistUpdate(
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

function applyIdeaUpdate(idea: IdeaNote, input: UpdateAnyNoteInput): IdeaNote {
  return {
    ...idea,
    title: input.title ?? idea.title,
    content: input.content ?? idea.content,
    tags: input.tags ?? idea.tags,
    color: input.color ?? idea.color,
    updatedAt: createTimestamp(),
  };
}

function normalizePersistedState(state: Partial<PersistedNotesState>): PersistedNotesState {
  return {
    notes: Array.isArray(state.notes) ? state.notes : [],
    checklists: Array.isArray(state.checklists) ? state.checklists : [],
    ideas: Array.isArray(state.ideas) ? state.ideas : [],
    archivedNotes: Array.isArray(state.archivedNotes) ? state.archivedNotes : [],
    archivedChecklists: Array.isArray(state.archivedChecklists)
      ? state.archivedChecklists
      : [],
    archivedIdeas: Array.isArray(state.archivedIdeas) ? state.archivedIdeas : [],
  };
}

function migratePersistedState(persistedState: unknown, version: number): PersistedNotesState {
  if (version >= 3) {
    return normalizePersistedState(persistedState as Partial<PersistedNotesState>);
  }

  if (version >= 2) {
    const state = persistedState as Partial<PersistedNotesState>;
    return normalizePersistedState({
      notes: state.notes,
      checklists: state.checklists,
      ideas: state.ideas,
      ...EMPTY_ARCHIVED,
    });
  }

  const legacy = persistedState as LegacyPersistedState;
  return {
    ...splitNotesByType(migratePersistedNotes(legacy.notes ?? [])),
    ...EMPTY_ARCHIVED,
  };
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      checklists: [],
      ideas: [],
      archivedNotes: [],
      archivedChecklists: [],
      archivedIdeas: [],
      _hasHydrated: false,

      getNotesByType: (type) => {
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
          state.ideas.find((idea) => idea.id === id)
        );
      },

      addNote: (note) => {
        set((state) => ({ notes: [note, ...state.notes] }));
      },

      addChecklist: (checklist) => {
        set((state) => ({ checklists: [checklist, ...state.checklists] }));
      },

      addIdea: (idea) => {
        set((state) => ({ ideas: [idea, ...state.ideas] }));
      },

      updateNote: (id, input) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? applyTextNoteUpdate(note, input) : note,
          ),
          checklists: state.checklists.map((checklist) =>
            checklist.id === id ? applyChecklistUpdate(checklist, input) : checklist,
          ),
          ideas: state.ideas.map((idea) =>
            idea.id === id ? applyIdeaUpdate(idea, input) : idea,
          ),
        }));
      },

      toggleChecklistItem: (checklistId, itemId) => {
        set((state) => ({
          checklists: state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  updatedAt: createTimestamp(),
                  items: checklist.items.map((item) =>
                    item.id === itemId
                      ? { ...item, completed: !item.completed }
                      : item,
                  ),
                }
              : checklist,
          ),
        }));
      },

      archiveNote: (id) => {
        set((state) => {
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
        });
      },

      unarchiveNote: (id) => {
        set((state) => {
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
        });
      },

      deleteChecklist: (id) => {
        set((state) => ({
          checklists: state.checklists.filter((checklist) => checklist.id !== id),
          archivedChecklists: state.archivedChecklists.filter(
            (checklist) => checklist.id !== id,
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
        }));
      },

      deleteIdea: (id) => {
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
          archivedIdeas: state.archivedIdeas.filter((idea) => idea.id !== id),
        }));
      },

      resetNotes: () =>
        set({
          notes: [],
          checklists: [],
          ideas: [],
          archivedNotes: [],
          archivedChecklists: [],
          archivedIdeas: [],
        }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: NOTES_STORAGE_KEY,
      storage: createJSONStorage(() => notesStateStorage),
      partialize: (state): PersistedNotesState => ({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
        archivedNotes: state.archivedNotes,
        archivedChecklists: state.archivedChecklists,
        archivedIdeas: state.archivedIdeas,
      }),
      version: 3,
      migrate: (persistedState, version) =>
        migratePersistedState(persistedState, version),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[notesStore] Error al rehidratar:', error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

useNotesStore.persist.onFinishHydration(() => {
  useNotesStore.getState().setHasHydrated(true);
});
