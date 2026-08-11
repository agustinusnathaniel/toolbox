export interface TextDiffSearchParams {
  modified?: string;
  original?: string;
}

export function buildTextDiffParams(
  original: string,
  modified: string
): URLSearchParams {
  const params = new URLSearchParams();
  if (original.trim()) {
    params.set('original', original);
  }
  if (modified.trim()) {
    params.set('modified', modified);
  }
  return params;
}

export function buildTextDiffStateFromSearch(search: TextDiffSearchParams): {
  original: string;
  modified: string;
} {
  return { modified: search.modified ?? '', original: search.original ?? '' };
}
