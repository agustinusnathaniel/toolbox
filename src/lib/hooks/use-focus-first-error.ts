/**
 * Moves focus to the first field the validator flagged, so keyboard and
 * screen-reader users land on the error instead of guessing. Scopes to the
 * given form element; falls back to the whole document when no ref is
 * attached. Pair with the second `handleSubmit` callback (the invalid
 * path), since valid submits navigate away on their own.
 */
export function focusFirstInvalidField(container: HTMLElement | null): void {
  const scope = container ?? document;
  const target = scope.querySelector<HTMLElement>(
    '[aria-invalid="true"], [data-invalid="true"]'
  );
  target?.focus();
}
