import type {
  AnyNote,
  ChecklistNote,
  IdeaNote,
  Note,
  NoteType,
  UpdateAnyNoteInput,
} from '../types';
import type { CreateAnyNoteInput } from '../types';

export const NOTES_STORAGE_KEY = 'noteflow-notes';

export interface NotesStoreState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  archivedNotes: Note[];
  archivedChecklists: ChecklistNote[];
  archivedIdeas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
}

export interface NotesStoreActions {
  initialize: () => Promise<void>;
  loadNotes: () => Promise<void>;
  createNote: (input: CreateAnyNoteInput) => Promise<void>;
  updateNote: (id: string, input: UpdateAnyNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesByType: (type: NoteType) => AnyNote[];
  getNoteById: (id: string) => AnyNote | undefined;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  resetNotes: () => void;
  setHasHydrated: (value: boolean) => void;
  clearError: () => void;
}

export type NotesStore = NotesStoreState & NotesStoreActions;
