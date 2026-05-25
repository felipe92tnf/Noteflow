import AsyncStorage from '@react-native-async-storage/async-storage';

import { NOTES_STORAGE_KEY } from './notesStoreTypes';

export type CachedNotesState = {
  notes: import('../types').Note[];
  checklists: import('../types').ChecklistNote[];
  ideas: import('../types').IdeaNote[];
  archivedNotes: import('../types').Note[];
  archivedChecklists: import('../types').ChecklistNote[];
  archivedIdeas: import('../types').IdeaNote[];
};

type ZustandPersistEnvelope = {
  state?: Partial<CachedNotesState>;
  version?: number;
};

function normalizeCachedState(partial: Partial<CachedNotesState>): CachedNotesState {
  return {
    notes: Array.isArray(partial.notes) ? partial.notes : [],
    checklists: Array.isArray(partial.checklists) ? partial.checklists : [],
    ideas: Array.isArray(partial.ideas) ? partial.ideas : [],
    archivedNotes: Array.isArray(partial.archivedNotes) ? partial.archivedNotes : [],
    archivedChecklists: Array.isArray(partial.archivedChecklists)
      ? partial.archivedChecklists
      : [],
    archivedIdeas: Array.isArray(partial.archivedIdeas) ? partial.archivedIdeas : [],
  };
}

export async function readNotesCache(): Promise<CachedNotesState | null> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedNotesState | ZustandPersistEnvelope;

    if ('state' in parsed && typeof parsed.state === 'object' && parsed.state !== null) {
      return normalizeCachedState(parsed.state);
    }

    return normalizeCachedState(parsed as Partial<CachedNotesState>);
  } catch (error) {
    console.warn('[notesCache] Error al leer caché:', error);
    return null;
  }
}

export async function writeNotesCache(state: CachedNotesState): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
        archivedNotes: state.archivedNotes,
        archivedChecklists: state.archivedChecklists,
        archivedIdeas: state.archivedIdeas,
      }),
    );
  } catch (error) {
    console.warn('[notesCache] Error al escribir caché:', error);
  }
}
