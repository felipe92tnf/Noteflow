export const IDEA_COLORS = ['red', 'blue', 'green', 'yellow', 'purple'] as const;

export type IdeaColor = (typeof IDEA_COLORS)[number];

export type NoteType = AnyNote['type'];

/** Alias de TextNote para notas de texto. */
export type Note = TextNote;

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteBase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextNote extends NoteBase {
  type: 'note';
  content: string;
}

export interface ChecklistNote extends NoteBase {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface IdeaNote extends NoteBase {
  type: 'idea';
  content: string;
  tags: string[];
  color: IdeaColor;
}

export type AnyNote = TextNote | ChecklistNote | IdeaNote;

export type CreateAnyNoteInput =
  | { type: 'note'; title: string; content: string }
  | { type: 'checklist'; title: string; items?: ChecklistItem[] }
  | { type: 'idea'; title: string; content?: string; tags: string[]; color: IdeaColor };

export type UpdateAnyNoteInput = {
  title?: string;
  content?: string;
  items?: ChecklistItem[];
  tags?: string[];
  color?: IdeaColor;
};

export function isTextNote(note: AnyNote): note is TextNote {
  return note.type === 'note';
}

export function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return note.type === 'checklist';
}

export function isIdeaNote(note: AnyNote): note is IdeaNote {
  return note.type === 'idea';
}
