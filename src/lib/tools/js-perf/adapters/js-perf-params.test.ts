import { describe, expect, test } from 'vite-plus/test';

import { DEFAULT_PRESET } from '@/routes/_tools/js-perf/-components/presets';

import {
  buildJsPerfParams,
  buildJsPerfStateFromSearch,
} from './js-perf-params';

const DEFAULT_STATE = {
  codeA: '',
  codeB: '',
  iterations: 30,
  preset: 'Object Creation',
  setupA: '',
  setupB: '',
  stabilityMode: false,
  stabilityRounds: 6,
  teardownA: '',
  teardownB: '',
};

describe('buildJsPerfParams', () => {
  test('returns empty params for default state', () => {
    const params = buildJsPerfParams({
      ...DEFAULT_STATE,
      codeA: DEFAULT_PRESET.codeA,
      codeB: DEFAULT_PRESET.codeB,
    });
    expect(params.toString()).toBe('');
  });

  test('sets non-default values', () => {
    const params = buildJsPerfParams({
      ...DEFAULT_STATE,
      codeA: 'customA',
      codeB: 'customB',
      iterations: 100,
      preset: 'Custom',
      stabilityMode: true,
      stabilityRounds: 10,
    });
    expect(params.get('preset')).toBe('Custom');
    expect(params.get('codeA')).toBe('customA');
    expect(params.get('codeB')).toBe('customB');
    expect(params.get('iterations')).toBe('100');
    expect(params.get('stabilityMode')).toBe('true');
    expect(params.get('stabilityRounds')).toBe('10');
  });

  test('includes non-empty setup/teardown', () => {
    const params = buildJsPerfParams({
      ...DEFAULT_STATE,
      setupA: 'console.log("a")',
      teardownB: 'cleanup()',
    });
    expect(params.get('setupA')).toBe('console.log("a")');
    expect(params.get('teardownB')).toBe('cleanup()');
    expect(params.has('setupB')).toBe(false);
    expect(params.has('teardownA')).toBe(false);
  });
});

describe('buildJsPerfStateFromSearch', () => {
  test('returns all defaults for empty search', () => {
    const state = buildJsPerfStateFromSearch({});
    expect(state.preset).toBe('Object Creation');
    expect(state.iterations).toBe(30);
    expect(state.stabilityMode).toBe(false);
    expect(state.stabilityRounds).toBe(6);
    expect(state.setupA).toBe('');
    expect(state.teardownB).toBe('');
  });

  test('parses string values', () => {
    const state = buildJsPerfStateFromSearch({
      codeA: 'customA',
      codeB: 'customB',
      preset: 'Custom',
      setupA: 'init()',
      teardownA: 'cleanup()',
    });
    expect(state.preset).toBe('Custom');
    expect(state.codeA).toBe('customA');
    expect(state.codeB).toBe('customB');
    expect(state.setupA).toBe('init()');
    expect(state.teardownA).toBe('cleanup()');
  });

  test('coerces numeric values', () => {
    const state = buildJsPerfStateFromSearch({
      iterations: '100',
      stabilityRounds: '10',
    });
    expect(state.iterations).toBe(100);
    expect(state.stabilityRounds).toBe(10);
  });

  test('coerces boolean stabilityMode', () => {
    expect(
      buildJsPerfStateFromSearch({ stabilityMode: 'true' }).stabilityMode
    ).toBe(true);
    expect(
      buildJsPerfStateFromSearch({ stabilityMode: 'false' }).stabilityMode
    ).toBe(false);
    expect(buildJsPerfStateFromSearch({}).stabilityMode).toBe(false);
  });

  test('clamps iterations to valid range', () => {
    expect(buildJsPerfStateFromSearch({ iterations: '0' }).iterations).toBe(30);
    expect(
      buildJsPerfStateFromSearch({ iterations: '999999' }).iterations
    ).toBe(100_000);
    expect(buildJsPerfStateFromSearch({ iterations: '-5' }).iterations).toBe(1);
  });

  test('clamps stabilityRounds to valid range', () => {
    expect(
      buildJsPerfStateFromSearch({ stabilityRounds: '0' }).stabilityRounds
    ).toBe(6);
    expect(
      buildJsPerfStateFromSearch({ stabilityRounds: '99' }).stabilityRounds
    ).toBe(50);
    expect(
      buildJsPerfStateFromSearch({ stabilityRounds: '-1' }).stabilityRounds
    ).toBe(1);
  });
});
