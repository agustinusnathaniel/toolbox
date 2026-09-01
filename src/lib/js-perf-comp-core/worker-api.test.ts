import { describe, expect, test } from 'vite-plus/test';

import { createExecutionRequest, parseWorkerMessage } from './worker-api';

describe('createExecutionRequest', () => {
  test('minimal arguments: UUID, correct code/deadline, defaults', () => {
    const req = createExecutionRequest('console.log("hi")', 5000);
    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe('string');
    expect(req.id.length).toBeGreaterThan(0);
    expect(req.code).toBe('console.log("hi")');
    expect(req.deadlineMs).toBe(5000);
    expect(req.iterations).toBe(30);
    expect(req.setup).toBe('');
    expect(req.teardown).toBe('');
  });
  test('all arguments provided: correct values in all fields', () => {
    const req = createExecutionRequest(
      'test-code',
      10_000,
      50,
      'setup()',
      'teardown()'
    );
    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe('string');
    expect(req.code).toBe('test-code');
    expect(req.deadlineMs).toBe(10_000);
    expect(req.iterations).toBe(50);
    expect(req.setup).toBe('setup()');
    expect(req.teardown).toBe('teardown()');
  });
});

describe('parseWorkerMessage', () => {
  test('type "result" with payload -> parsed message', () => {
    const payload = {
      code: '',
      durationMs: null,
      errorMessage: null,
      id: 'abc',
      output: [],
      perIterationMs: null,
      statistics: null,
      status: 'success',
    };
    expect(parseWorkerMessage({ payload, type: 'result' })).toStrictEqual({
      payload,
      type: 'result',
    });
  });
  test('null -> returns null', () => {
    expect(parseWorkerMessage(null)).toBeNull();
  });
  test('non-object -> returns null', () => {
    expect(parseWorkerMessage('hello')).toBeNull();
    expect(parseWorkerMessage(42)).toBeNull();
  });
  test('unknown type -> returns null', () => {
    expect(parseWorkerMessage({ type: 'unknown' })).toBeNull();
  });
  test('result without payload -> returns null', () => {
    expect(parseWorkerMessage({ type: 'result' })).toBeNull();
  });
});
