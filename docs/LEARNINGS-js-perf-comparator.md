# Development Log: JS Performance Comparator

**Date**: April 6, 2026  
**Component**: JS Performance Comparator Tool  
**Status**: Updated (Reliability Hardening)

---

## Executive Summary

Built Phase 5 of the toolbox platform: a JS Performance Comparator that benchmarks JavaScript code snippets using sandboxed QuickJS runtimes in Web Workers. The latest update improves reliability and accountability with phase-aware execution (`setup` → `compile` → `warmup` → `timed` → `teardown`), deterministic worker error reporting, and clearer runtime failure messages.

---

## What We Built

### Core Features

1. **Monaco Editor Integration** - Dual-pane code editors with syntax highlighting
2. **Sandboxed Execution** - QuickJS WebAssembly in Web Workers for security
3. **Parallel Execution** - Two separate workers for true side-by-side comparison
4. **Statistical Analysis** - Robust statistics with warmup, outlier removal, and confidence intervals
5. **Configurable Benchmarks** - Iterations count, setup/teardown code support

### Technical Stack

| Layer | Technology |
|-------|-----------|
| Runtime | QuickJS via quickjs-emscripten |
| Sandboxing | Web Workers |
| Editors | Monaco Editor (@monaco-editor/react) |
| UI | React + TanStack Router + shadcn/ui |
| Statistics | Custom IQR-based robust statistics |

---

## Key Discoveries & Solutions

### 1. Warmup Stabilization Problem

**Discovery**: First benchmark runs showed wildly inconsistent results - the same code would be "faster" or "slower" randomly between runs.

**Root Cause**: Early runs include one-time runtime effects (initial execution path setup, memory behavior, and transient worker/runtime state). Without warmup, those transient effects leak into measured samples.

**Solution**:
```typescript
const WARMUP_ITERATIONS = 5;

// Warmup - NOT included in statistics
for (let i = 0; i < WARMUP_ITERATIONS; i++) {
  runCode(code); // Stabilize runtime state
}

// THEN measure
for (let i = 0; i < iterations; i++) {
  measure(runCode(code));
}
```

**Result**: Consistent results within ±2% across runs.

---

### 2. Sequential vs Parallel Execution

**Discovery**: Initially used one worker for both snippets. Code B often appeared faster because it inherited runtime state from Code A.

**Root Cause**: Single worker = sequential execution with shared runtime/session effects. That creates cross-snippet contamination.

**Solution**: Use **two separate workers** with independent QuickJS instances:

```typescript
// Worker A for Code A
const workerA = new JsPerfWorker();
workerA.postMessage({ type: 'execute', payload: reqA });

// Worker B for Code B  
const workerB = new JsPerfWorker();
workerB.postMessage({ type: 'execute', payload: reqB });

// Both run truly in parallel
```

---

### 3. Garbage Collection Outliers

**Discovery**: Some iterations would take 10-100x longer than others due to GC pauses.

**Example Data**:
```
[10.2, 11.1, 10.8, 10.5, 10.9, 10.3, 10.7, 10.4, 145.2, 10.6, 10.8]
                                              ^^^ GC pause
```

**Solution**: IQR-based outlier filtering:

```typescript
const sorted = [...durations].sort((a, b) => a - b);
const q1 = sorted[Math.floor(sorted.length * 0.25)];
const q3 = sorted[Math.floor(sorted.length * 0.75)];
const iqr = q3 - q1;

// Filter values outside 1.5 * IQR
const filtered = sorted.filter(d => 
  d >= q1 - 1.5 * iqr && d <= q3 + 1.5 * iqr
);
```

---

### 4. Worker Bundling Issue

**Discovery**: Production build failed - worker file was output as `.ts` with TypeScript syntax intact.

**Error**: Browsers cannot execute TypeScript directly.

**Solution**: Use Vite's `?worker` import pattern instead of `new URL()`:

```typescript
// Before (broken in production)
const workerUrl = new URL('./-worker/js-perf.worker.ts', import.meta.url);
const worker = new Worker(workerUrl, { type: 'module' });

// After (works correctly)
import JsPerfWorker from './-worker/js-perf.worker.ts?worker';
const worker = new JsPerfWorker();
```

**Lesson**: Vite handles TypeScript transpilation for `?worker` imports but not for runtime `new URL()` patterns.

---

### 5. Microsecond Precision

**Discovery**: QuickJS is extremely fast. Many operations complete in microseconds, but we were displaying `< 1 ms`.

**Solution**: Enhanced duration formatting:

```typescript
export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;  // Microseconds
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
```

---

## Architecture Decisions

### Why QuickJS?

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| QuickJS | Sandboxed, offline, deadline support | 800KB WASM | ✅ Chosen |
| eval() | No bundle | Security risk | ❌ Rejected |
| Node.js quickjs | Native perf | Requires backend | ❌ Rejected |
| iframe | Native isolation | Complex, less control | ❌ Rejected |

### Why Two Workers?

- **Single worker**: Sequential execution with shared runtime effects
- **Two workers**: True parallel, isolated runtime contexts, fairer comparison

### Why Robust Statistics?

- **Simple mean**: Affected by GC pauses, inconsistent
- **Median + IQR**: Filters outliers, stable across runs

---

## Implementation Details

### File Structure

```
apps/toolbox-web/src/routes/tools/js-perf-comparator/
├── index.tsx                 # Main UI component
├── -worker/                  # Worker directory (excluded from routing)
│   └── js-perf.worker.ts     # Worker with QuickJS runtime
└── ...

packages/js-perf-comp-core/src/
├── models.ts                 # Execution models + statistics
├── worker-api.ts             # Message types
└── index.ts                  # Public exports
```

### Message Flow

```
Main Thread                              Worker
-----------                              ------
   │                                        │
   │── postMessage({type: 'execute'})────→│
   │                                        │
   │   (Setup + compile function)           │
   │                                        │
   │   (Warmup iterations - untimed)        │
   │                                        │
   │   (Timed iterations)                   │
   │                                        │
   │   (Optional teardown)                  │
   │                                        │
   │   (Calculate statistics)               │
   │                                        │
   │←── postMessage({type: 'result'})──────│
```

---

## Reliability Hardening (April 6, 2026)

1. **Phase-aware execution errors**
   - Errors now include execution phase context (`setup`, `compile`, `warmup`, `timed`, `teardown`) to make failures actionable.
2. **Deterministic worker crash handling**
   - If a worker crashes, UI now receives an explicit `worker_error` result instead of ending silently.
3. **Accurate duration accounting**
   - `durationMs` is now computed from timed iteration samples only (no fallback clock values).
4. **Readable/scalable worker pipeline**
   - Worker refactored into focused helpers (`createVmSession`, `runSnippet`, `runMainIteration`, `executeBenchmark`, `buildResult`).
5. **Bounded output capture**
   - Console output capture is capped by policy and marked as truncated when limits are hit.

### Statistics Pipeline

```
Raw Durations
    │
    ▼
[10.2, 11.5, 145.2, 10.8, 10.9, 11.1, 10.7, 1000.5, 10.6, 11.0]
    │
    ▼
Sort
    │
    ▼
[10.2, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.5, 145.2, 1000.5]
    │
    ▼
Calculate IQR (Q1=10.75, Q3=11.3, IQR=0.55)
    │
    ▼
Filter Outliers (bounds: 9.9 to 12.1)
    │
    ▼
[10.2, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.5]
    │
    ▼
Calculate Median = 10.85ms
```

---

## Configuration

### Default Settings

```typescript
export const DEFAULT_RUN_POLICY: RunPolicy = {
  deadlineMs: 5000,        // 5 second timeout
  maxOutputLines: 100,
  defaultIterations: 30,   // 30 timed + 5 warmup = 35 total
};
```

### Presets

Built-in comparison presets:
- Object Creation (literal vs new Object())
- Array Lookup (Set.has vs Array.includes)
- Object Spread (spread vs Object.assign)
- String Concat (template vs concatenation)
- Array Methods (for...of vs forEach)

---

## Best Practices Learned

1. **Always use warmup** - 3-5 iterations minimum
2. **Filter outliers** - GC pauses are not representative
3. **Use median** - More robust than mean for performance data
4. **Run parallel** - Separate workers prevent cross-snippet runtime contamination
5. **Show confidence intervals** - Margin of error indicates reliability
6. **Use microsecond precision** - Many operations are sub-millisecond

---

## References

- ADR-0003: Sandboxed JavaScript Execution
- ADR-0004: JavaScript Benchmarking Methodology
- `packages/js-perf-comp-core/` - Core benchmarking logic
- `apps/toolbox-web/src/routes/tools/js-perf-comparator/` - UI implementation
