import { z } from 'zod';

import { IDEA_COLORS } from '../types';

export const noteFormSchema = z.object({
  type: z.literal('note'),
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().trim().min(1, 'El contenido es obligatorio'),
});

export const checklistFormSchema = z.object({
  type: z.literal('checklist'),
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  items: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'El ítem no puede estar vacío'),
      }),
    )
    .min(1, 'Añade al menos un ítem'),
});

export const ideaFormSchema = z.object({
  type: z.literal('idea'),
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  tags: z
    .array(z.string().trim().min(1, 'La etiqueta no puede estar vacía'))
    .min(1, 'Añade al menos una etiqueta'),
  color: z.enum(IDEA_COLORS, {
    error: 'Selecciona un color',
  }),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;
export type IdeaFormValues = z.infer<typeof ideaFormSchema>;

export type FormErrors = Record<string, string | undefined>;

export function mapZodErrors(error: z.ZodError): FormErrors {
  const mapped: FormErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !mapped[key]) {
      mapped[key] = issue.message;
    }
    if (issue.path[0] === 'items' && issue.path.length > 1) {
      mapped.items = issue.message;
    }
    if (issue.path[0] === 'tags') {
      mapped.tags = issue.message;
    }
  }

  return mapped;
}
