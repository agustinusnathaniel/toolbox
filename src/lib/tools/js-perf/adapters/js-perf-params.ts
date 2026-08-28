import { DEFAULT_RUN_POLICY } from '@/lib/js-perf-comp-core/models';
import {
  DEFAULT_PRESET,
  STABILITY_DEFAULT_ROUNDS,
} from '@/routes/_tools/js-perf/-components/presets';

export interface JsPerfSearchParams {
  codeA?: string;
  codeB?: string;
  iterations?: string;
  preset?: string;
  setupA?: string;
  setupB?: string;
  stabilityMode?: string;
  stabilityRounds?: string;
  teardownA?: string;
  teardownB?: string;
}

export interface JsPerfState {
  codeA: string;
  codeB: string;
  iterations: number;
  preset: string;
  setupA: string;
  setupB: string;
  stabilityMode: boolean;
  stabilityRounds: number;
  teardownA: string;
  teardownB: string;
}

export function buildJsPerfParams(state: JsPerfState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.preset !== DEFAULT_PRESET.name) {
    params.set('preset', state.preset);
  }
  if (state.codeA !== DEFAULT_PRESET.codeA) {
    params.set('codeA', state.codeA);
  }
  if (state.codeB !== DEFAULT_PRESET.codeB) {
    params.set('codeB', state.codeB);
  }
  if (state.iterations !== DEFAULT_RUN_POLICY.defaultIterations) {
    params.set('iterations', String(state.iterations));
  }
  if (state.stabilityMode) {
    params.set('stabilityMode', 'true');
  }
  if (state.stabilityRounds !== STABILITY_DEFAULT_ROUNDS) {
    params.set('stabilityRounds', String(state.stabilityRounds));
  }
  if (state.setupA) {
    params.set('setupA', state.setupA);
  }
  if (state.setupB) {
    params.set('setupB', state.setupB);
  }
  if (state.teardownA) {
    params.set('teardownA', state.teardownA);
  }
  if (state.teardownB) {
    params.set('teardownB', state.teardownB);
  }
  return params;
}

export function buildJsPerfStateFromSearch(
  search: JsPerfSearchParams
): JsPerfState {
  return {
    codeA: search.codeA ?? DEFAULT_PRESET.codeA,
    codeB: search.codeB ?? DEFAULT_PRESET.codeB,
    iterations: Math.max(
      1,
      Math.min(
        100_000,
        Number(search.iterations) || DEFAULT_RUN_POLICY.defaultIterations
      )
    ),
    preset: search.preset ?? DEFAULT_PRESET.name,
    setupA: search.setupA ?? '',
    setupB: search.setupB ?? '',
    stabilityMode: search.stabilityMode === 'true',
    stabilityRounds: Math.min(
      50,
      Math.max(1, Number(search.stabilityRounds) || STABILITY_DEFAULT_ROUNDS)
    ),
    teardownA: search.teardownA ?? '',
    teardownB: search.teardownB ?? '',
  };
}
