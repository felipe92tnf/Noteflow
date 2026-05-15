export function resolveParamId(id: string | string[] | undefined): string | undefined {
  if (typeof id === 'string') {
    return id;
  }
  if (Array.isArray(id)) {
    return id[0];
  }
  return undefined;
}
