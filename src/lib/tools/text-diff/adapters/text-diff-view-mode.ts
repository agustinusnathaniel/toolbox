export type DiffViewMode = 'unified' | 'split';

/**
 * Minimum diff container width (px) for split view to be readable. The
 * @pierre/diffs split renderer lays each side out on a fixed grid (line-number
 * gutter + content); below this width a side collapses to under ~280px and the
 * package's grid overflows into an unreadable horizontal scroll. Below this
 * width the tool renders unified instead, where the package's `overflow: wrap`
 * keeps lines readable.
 */
export const SPLIT_VIEW_MIN_WIDTH_PX = 640;

export function isSplitViewUsable(containerWidthPx: number): boolean {
  return containerWidthPx >= SPLIT_VIEW_MIN_WIDTH_PX;
}

/**
 * Resolves the diff style that should actually be rendered. Split is only
 * rendered when the container is wide enough for the package's grid to fit;
 * otherwise unified is used so narrow screens never show an unreadable,
 * horizontally-scrolling split. The rendered style is what the view control's
 * `aria-pressed` reflects, so the UI never lies about the active view.
 */
export function resolveDiffViewMode(
  preferred: DiffViewMode,
  splitViewUsable: boolean
): DiffViewMode {
  return splitViewUsable ? preferred : 'unified';
}
