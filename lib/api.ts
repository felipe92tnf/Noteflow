export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const FALLBACK_API_URL = 'http://192.168.1.143:3000/api';

function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Error en la API';

    try {
      const errorData = await response.json();
      message = errorData.error ?? message;
    } catch {}

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
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
  items?: {
    text: string;
    completed?: boolean;
  }[];
  tags?: string[];
  color?: string;
};

export type UpdateNoteDto = {
  title?: string;
  content?: string;
  color?: string;
  archived?: boolean;
};

export const notesApi = {
  async fetchAll(): Promise<ApiNoteRecord[]> {
    return apiRequest<ApiNoteRecord[]>('/notes');
  },

  async fetchById(id: string): Promise<ApiNoteRecord> {
    return apiRequest<ApiNoteRecord>(`/notes/${id}`);
  },

  async create(data: CreateNoteDto): Promise<ApiNoteRecord> {
    return apiRequest<ApiNoteRecord>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: UpdateNoteDto
  ): Promise<ApiNoteRecord> {
    return apiRequest<ApiNoteRecord>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  async getChecklistItems(noteId: string) {
    return apiRequest<ApiChecklistItem[]>(
      `/notes/${noteId}/checklist-items`
    );
  },

  async createChecklistItem(noteId: string, text: string) {
    return apiRequest(`/notes/${noteId}/checklist-items`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async updateChecklistItem(
    itemId: string,
    is_completed: boolean
  ) {
    return apiRequest(`/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed }),
    });
  },

  async deleteChecklistItem(itemId: string) {
    return apiRequest(`/checklist-items/${itemId}`, {
      method: 'DELETE',
    });
  },
};