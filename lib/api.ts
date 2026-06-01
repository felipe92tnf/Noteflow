export class ApiError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

const FALLBACK_API_URL = 'http://192.168.1.155:3000/api';

export const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el backend. Revisa que el servidor esté arrancado y que el móvil esté en la misma red WiFi.';

function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  const baseUrl = configured || FALLBACK_API_URL;
  return baseUrl.replace(/\/$/, '');
}

function buildRequestUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('timeout')
  );
}

function logApiRequest(url: string, method: string): void {
  if (__DEV__) {
    console.log(`[api] ${method} ${url}`);
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = buildRequestUrl(endpoint);
  const method = options?.method ?? 'GET';

  logApiRequest(url, method);

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers ?? {}),
      },
    });
  } catch (error) {
    console.warn('[api] Network error:', { url, method, error });

    if (isNetworkFailure(error)) {
      throw new ApiError(NETWORK_ERROR_MESSAGE, undefined, true);
    }

    throw new ApiError(toErrorMessage(error), undefined, true);
  }

  if (!response.ok) {
    let message = 'Error en la API';

    try {
      const errorData = (await response.json()) as { error?: string; message?: string };
      message = errorData.error ?? errorData.message ?? message;
    } catch {
      // ignore invalid JSON body
    }

    console.warn('[api] HTTP error:', { url, method, status: response.status, message });
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.warn('[api] Invalid JSON response:', { url, method, error });
    throw new ApiError('Respuesta inválida del backend', response.status);
  }
}

export type ApiChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type ApiNoteRecord = {
  id: string;
  type: 'note' | 'checklist' | 'idea';
  title: string;
  content: string | null;
  items: ApiChecklistItem[];
  tags: string[];
  color: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteDto = {
  type: 'note' | 'checklist' | 'idea';
  title: string;
  content?: string;
  tags?: string[];
  color?: string;
};

export type UpdateNoteDto = {
  title?: string;
  content?: string;
  tags?: string[];
  color?: string;
  archived?: boolean;
};

export type NotesPartition = {
  notes: import('../types').Note[];
  checklists: import('../types').ChecklistNote[];
  ideas: import('../types').IdeaNote[];
  archivedNotes: import('../types').Note[];
  archivedChecklists: import('../types').ChecklistNote[];
  archivedIdeas: import('../types').IdeaNote[];
};

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (isNetworkFailure(error)) {
      return NETWORK_ERROR_MESSAGE;
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Error desconocido';
}

function unwrapEntity(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'note' in payload) {
    return (payload as { note: unknown }).note;
  }

  if (payload && typeof payload === 'object' && 'checklist_item' in payload) {
    return (payload as { checklist_item: unknown }).checklist_item;
  }

  if (payload && typeof payload === 'object' && 'item' in payload) {
    return (payload as { item: unknown }).item;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

function parseArchivedFlag(value: unknown): boolean {
  return value === true || value === 1 || value === 'true' || value === 't';
}

function normalizeApiChecklistItem(raw: unknown): ApiChecklistItem | null {
  const payload = unwrapEntity(raw);
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.text !== 'string') {
    return null;
  }

  return {
    id: record.id,
    text: record.text,
    completed: record.completed === true || record.is_completed === true,
  };
}

function normalizeChecklistItems(raw: unknown): ApiChecklistItem[] {
  const source = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && 'checklist_items' in raw
      ? (raw as { checklist_items: unknown }).checklist_items
      : raw && typeof raw === 'object' && 'items' in raw
        ? (raw as { items: unknown }).items
        : [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map(normalizeApiChecklistItem)
    .filter((item): item is ApiChecklistItem => item !== null);
}

function normalizeRawApiNote(raw: unknown): ApiNoteRecord | null {
  const payload = unwrapEntity(raw);
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const type = record.type;
  const id = record.id;
  const title = record.title;

  if (typeof type !== 'string' || typeof id !== 'string' || typeof title !== 'string') {
    return null;
  }

  if (type !== 'note' && type !== 'checklist' && type !== 'idea') {
    return null;
  }

  const createdAtRaw = record.createdAt ?? record.created_at;
  const updatedAtRaw = record.updatedAt ?? record.updated_at;
  const fallbackTimestamp = new Date().toISOString();
  const createdAt = typeof createdAtRaw === 'string' ? createdAtRaw : fallbackTimestamp;
  const updatedAt = typeof updatedAtRaw === 'string' ? updatedAtRaw : createdAt;

  return {
    id,
    type,
    title,
    content: typeof record.content === 'string' ? record.content : null,
    items: normalizeChecklistItems(record.items ?? record.checklist_items),
    tags: Array.isArray(record.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    color: typeof record.color === 'string' ? record.color : null,
    archived: parseArchivedFlag(record.archived ?? record.is_archived),
    createdAt,
    updatedAt,
  };
}

function extractNoteRecords(payload: unknown): ApiNoteRecord[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        'notes' in payload &&
        Array.isArray((payload as { notes: unknown }).notes)
      ? (payload as { notes: unknown[] }).notes
      : payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          Array.isArray((payload as { data: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : [unwrapEntity(payload)];

  return list
    .map(normalizeRawApiNote)
    .filter((record): record is ApiNoteRecord => record !== null);
}

async function hydrateChecklistItems(record: ApiNoteRecord): Promise<ApiNoteRecord> {
  if (record.type !== 'checklist' || record.items.length > 0) {
    return record;
  }

  try {
    const rawItems = await apiRequest<unknown>(`/notes/${record.id}/checklist-items`);
    return { ...record, items: normalizeChecklistItems(rawItems) };
  } catch (error) {
    console.warn('[api] Could not load checklist items:', record.id, error);
    return record;
  }
}

export function mapApiNoteRecordToAnyNote(record: ApiNoteRecord): import('../types').AnyNote {
  if (record.type === 'checklist') {
    return {
      id: record.id,
      type: 'checklist',
      title: record.title,
      items: record.items,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  if (record.type === 'idea') {
    const color = record.color;
    const ideaColor =
      color === 'red' ||
      color === 'blue' ||
      color === 'green' ||
      color === 'yellow' ||
      color === 'purple'
        ? color
        : 'blue';

    return {
      id: record.id,
      type: 'idea',
      title: record.title,
      content: record.content ?? '',
      tags: record.tags,
      color: ideaColor,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  return {
    id: record.id,
    type: 'note',
    title: record.title,
    content: record.content ?? '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function partitionApiNotes(records: ApiNoteRecord[]): NotesPartition {
  const partition: NotesPartition = {
    notes: [],
    checklists: [],
    ideas: [],
    archivedNotes: [],
    archivedChecklists: [],
    archivedIdeas: [],
  };

  for (const record of records) {
    const note = mapApiNoteRecordToAnyNote(record);

    if (note.type === 'note') {
      (record.archived ? partition.archivedNotes : partition.notes).push(note);
    } else if (note.type === 'checklist') {
      (record.archived ? partition.archivedChecklists : partition.checklists).push(note);
    } else {
      (record.archived ? partition.archivedIdeas : partition.ideas).push(note);
    }
  }

  return sanitizeNotesPartition(partition);
}

/** Evita que un id aparezca en listas activas y archivadas a la vez. */
export function sanitizeNotesPartition(partition: NotesPartition): NotesPartition {
  const archivedIds = new Set([
    ...partition.archivedNotes.map((note) => note.id),
    ...partition.archivedChecklists.map((note) => note.id),
    ...partition.archivedIdeas.map((note) => note.id),
  ]);

  return {
    notes: partition.notes.filter((note) => !archivedIds.has(note.id)),
    checklists: partition.checklists.filter((note) => !archivedIds.has(note.id)),
    ideas: partition.ideas.filter((note) => !archivedIds.has(note.id)),
    archivedNotes: partition.archivedNotes,
    archivedChecklists: partition.archivedChecklists,
    archivedIdeas: partition.archivedIdeas,
  };
}

export function mapCreateAnyNoteInputToDto(
  input: import('../types').CreateAnyNoteInput,
): CreateNoteDto {
  if (input.type === 'note') {
    return { type: 'note', title: input.title, content: input.content };
  }

  if (input.type === 'checklist') {
    return { type: 'checklist', title: input.title };
  }

  return {
    type: 'idea',
    title: input.title,
    content: input.content ?? '',
    tags: input.tags,
    color: input.color,
  };
}

/** @deprecated Use mapCreateAnyNoteInputToDto */
export const mapCreateInputToPayload = mapCreateAnyNoteInputToDto;

export function mapUpdateInputToPayload(
  input: import('../types').UpdateAnyNoteInput & { archived?: boolean },
): UpdateNoteDto {
  const payload: UpdateNoteDto = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.content !== undefined) payload.content = input.content;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.color !== undefined) payload.color = input.color;
  if (input.archived !== undefined) payload.archived = input.archived;

  return payload;
}

export function mapArchivePayload(archived: boolean): UpdateNoteDto {
  return { archived };
}

export const notesApi = {
  async fetchAll(): Promise<NotesPartition> {
    const records = extractNoteRecords(await apiRequest<unknown>('/notes'));
    const hydrated = await Promise.all(records.map(hydrateChecklistItems));
    return partitionApiNotes(hydrated);
  },

  async fetchById(id: string): Promise<ApiNoteRecord> {
    const payload = await apiRequest<unknown>(`/notes/${id}`);
    const record = normalizeRawApiNote(payload);
    if (!record) {
      throw new ApiError('Nota no encontrada');
    }
    return hydrateChecklistItems(record);
  },

  async create(data: CreateNoteDto): Promise<ApiNoteRecord> {
    const payload = await apiRequest<unknown>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const record = normalizeRawApiNote(payload);
    if (!record) {
      throw new ApiError('Respuesta de creación inválida');
    }
    return record;
  },

  async createChecklist(
    title: string,
    items: { text: string; completed?: boolean }[],
  ): Promise<ApiNoteRecord> {
    const note = await notesApi.create({ type: 'checklist', title });
    const createdItems: ApiChecklistItem[] = [];

    for (const item of items) {
      const payload = await apiRequest<unknown>(`/notes/${note.id}/checklist-items`, {
        method: 'POST',
        body: JSON.stringify({ text: item.text }),
      });
      const normalized = normalizeApiChecklistItem(payload);
      if (normalized) {
        createdItems.push(normalized);
      }
    }

    return { ...note, type: 'checklist', items: createdItems };
  },

  async update(id: string, data: UpdateNoteDto): Promise<ApiNoteRecord> {
    const payload = await apiRequest<unknown>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    const record = normalizeRawApiNote(payload);
    if (!record) {
      throw new ApiError('Respuesta de actualización inválida');
    }
    return hydrateChecklistItems(record);
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  async getChecklistItems(noteId: string): Promise<ApiChecklistItem[]> {
    const payload = await apiRequest<unknown>(`/notes/${noteId}/checklist-items`);
    return normalizeChecklistItems(payload);
  },

  async createChecklistItem(noteId: string, text: string): Promise<ApiChecklistItem> {
    const payload = await apiRequest<unknown>(`/notes/${noteId}/checklist-items`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    const item = normalizeApiChecklistItem(payload);
    if (!item) {
      throw new ApiError('Respuesta de ítem inválida');
    }
    return item;
  },

  async updateChecklistItem(itemId: string, isCompleted: boolean): Promise<ApiChecklistItem> {
    const payload = await apiRequest<unknown>(`/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    });
    const item = normalizeApiChecklistItem(payload);
    if (!item) {
      throw new ApiError('Respuesta de ítem inválida');
    }
    return item;
  },

  async deleteChecklistItem(itemId: string): Promise<void> {
    return apiRequest<void>(`/checklist-items/${itemId}`, {
      method: 'DELETE',
    });
  },
};
