export interface CronSearchParams {
  expression?: string;
}

export function buildCronParams(expression: string): URLSearchParams {
  const params = new URLSearchParams();
  if (expression.trim()) {
    params.set('expression', expression);
  }
  return params;
}

export function buildCronStateFromSearch(search: CronSearchParams): {
  expression: string;
} {
  return {
    expression: search.expression ?? '',
  };
}
