/** Título de pestaña con contador, p. ej. «Notas (3)». */
export function tabTitleWithCount(label: string, count: number): string {
  return `${label} (${count})`;
}
