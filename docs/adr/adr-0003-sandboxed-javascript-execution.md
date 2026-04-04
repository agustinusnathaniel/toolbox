---
title: "ADR-0003: Sandboxed JavaScript Execution with quickjs-emscripten"
status: "Accepted"
date: "2026-03-31"
authors: "Nathan, OpenCode"
tags: ["architecture", "decision", "toolbox", "security", "performance"]
supersedes: ""
superseded_by: ""
---

# ADR-0003: Sandboxed JavaScript Execution with quickjs-emscripten

## Status

**Accepted** | Proposed | Rejected | Superseded | Deprecated

## Context

The JS Performance Comparator tool requires executing arbitrary JavaScript code submitted by users. This creates a fundamental security challenge:

- Users can paste **any** JavaScript code, including potentially malicious code
- The code must be executed in a way that prevents access to sensitive data (cookies, localStorage, session tokens)
- The code must not be able to modify the DOM or make network requests
- Infinite loops must be terminated with a deadline
- The solution must work entirely client-side (no backend server required)

The execution environment must provide:

1. **Memory isolation** — Cannot access main thread memory
2. **No DOM access** — Cannot manipulate the page
3. **No network access** — Cannot make fetch/XMLHttpRequest calls
4. **Deadline enforcement** — Prevents infinite loops
5. **Browser compatibility** — Works in all modern browsers
6. **Offline support** — Works without network after initial load

## Decision

Use **`quickjs-emscripten`** running in a **Web Worker** with deadline-based interruption.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Main Thread                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    JS Perf Comparator                       ││
│  │  - Monaco editors for code input                          ││
│  │  - React state management                                  ││
│  │  - Result display                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                    postMessage()                                │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                    Web Worker Boundary
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      Web Worker                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   quickjs-emscripten                        ││
│  │  - QuickJS compiled to WebAssembly                         ││
│  │  - Isolated memory space                                   ││
│  │  - No DOM/window access                                    ││
│  │  - `shouldInterruptAfterDeadline()` for timeouts           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Details

1. **Worker URL Pattern**: `new URL('./-worker/js-perf.worker.ts', import.meta.url)` with TanStack Router's `-` prefix to exclude from routing
2. **Worker ID Tracking**: `workerIdRef` counter to ignore stale messages from terminated workers (StrictMode compatibility)
3. **Deadline Enforcement**: `shouldInterruptAfterDeadline(Date.now() + 5000)` for 5-second timeout
4. **Code Wrapping**: User code wrapped in a console-capturing function to capture `console.log` output

## Options Considered

### Option A: quickjs-emscripten (Chosen)

| Dimension       | Assessment                                    |
| --------------- | --------------------------------------------- |
| Browser support | Excellent — WASM works in all modern browsers |
| Security        | Excellent — Complete isolation in Worker      |
| Offline support | Excellent — WASM cached after first load      |
| Bundle size     | ~800KB WASM (acceptable for this tool)        |
| Latency         | Excellent — No network round-trip             |
| Maintenance     | Good — Active upstream project                |

**Pros:**

- True sandboxed execution with no DOM/network access
- Runs entirely client-side, no backend needed
- Works offline after initial load
- Deadline-based interruption built-in
- Active maintenance and good documentation

**Cons:**

- ~800KB bundle size for WASM binary
- Learning curve for Web Worker message passing
- StrictMode requires worker ID tracking

### Option B: quickjs (Node.js native binding)

| Dimension       | Assessment                              |
| --------------- | --------------------------------------- |
| Browser support | None — requires Node.js runtime         |
| Security        | Good — but requires backend API         |
| Offline support | None — requires server connection       |
| Bundle size     | N/A (server-side)                       |
| Latency         | Poor — network round-trip per execution |
| Maintenance     | Good — actively maintained              |

**Pros:**

- Simpler API (direct execution, no Worker complexity)
- Native performance

**Cons:**

- Requires backend server
- Network latency for every execution
- Infrastructure costs
- No offline support
- Server must handle potentially malicious code

### Option C: quickjs-ng (Node.js native binding, fork of quickjs)

| Dimension       | Assessment                              |
| --------------- | --------------------------------------- |
| Browser support | None — requires Node.js runtime         |
| Security        | Good — but requires backend API         |
| Offline support | None — requires server connection       |
| Bundle size     | N/A (server-side)                       |
| Latency         | Poor — network round-trip per execution |
| Maintenance     | Good — newer fork with improvements     |

**Pros:**

- Performance improvements over original quickjs
- Simpler API than Worker-based solution

**Cons:**

- Same as Option B — requires backend server
- Network latency and infrastructure complexity

### Option D: eval() or new Function()

| Dimension       | Assessment                              |
| --------------- | --------------------------------------- |
| Browser support | Excellent — native JavaScript           |
| Security        | **Critical failure** — full page access |
| Offline support | Excellent                               |
| Bundle size     | 0KB                                     |
| Latency         | Excellent                               |

**Pros:**

- No bundle size overhead
- Instant execution

**Cons:**

- **CRITICAL SECURITY ISSUE**: Full access to cookies, localStorage, DOM, fetch
- Cannot prevent malicious code
- Shared memory with main thread
- Not a viable option for user-submitted code

### Option E: iframe sandbox

| Dimension       | Assessment                               |
| --------------- | ---------------------------------------- |
| Browser support | Good                                     |
| Security        | Moderate — depends on sandbox attributes |
| Offline support | Excellent                                |
| Bundle size     | Minimal                                  |
| Latency         | Moderate — iframe creation overhead      |

**Pros:**

- Native browser isolation
- Can use `sandbox` attribute for restrictions

**Cons:**

- Still has some DOM access within iframe
- Complex message passing
- Less control over execution deadline
- Difficult to capture console.log output
- Security is not as robust as WASM sandbox

## Trade-off Analysis

| Trade-off                   | Decision    | Reasoning                                                                 |
| --------------------------- | ----------- | ------------------------------------------------------------------------- |
| Bundle size vs. Security    | Security    | 800KB is acceptable for a developer tool; user security is non-negotiable |
| Client-side vs. Server-side | Client-side | Eliminates latency, infrastructure costs, and enables offline use         |
| Simplicity vs. Isolation    | Isolation   | Worker complexity is worth the guaranteed sandbox isolation               |
| Native vs. WASM             | WASM        | WASM runs everywhere browsers run; native requires specific runtimes      |

## Consequences

### Positive

- **POS-001**: Users can safely execute any JavaScript without security concerns
- **POS-002**: No backend required — works entirely client-side
- **POS-003**: Works offline after initial load (WASM cached)
- **POS-004**: Deadline enforcement prevents infinite loops from freezing the browser
- **POS-005**: Clear separation between user code and platform code

### Negative

- **NEG-001**: ~800KB WASM bundle increases initial load time for this tool
- **NEG-002**: Web Worker complexity requires careful state management
- **NEG-003**: `console.log` output requires code wrapping (not native console)
- **NEG-004**: Error messages from QuickJS may differ slightly from V8

### Neutral

- **NEU-001**: QuickJS implements ES2023, not the latest ECMAScript features — acceptable for performance comparison tool
- **NEU-002**: Users must understand results are from QuickJS runtime, not native browser engine

## Implementation Notes

- **IMP-001**: Worker file placed in `-worker/` directory to exclude from TanStack Router routing
- **IMP-002**: `workerIdRef` counter tracks current worker to ignore stale messages (StrictMode compatibility)
- **IMP-003**: `pendingRef` Set tracks pending executions by full ID (`a-${uuid}`, `b-${uuid}`)
- **IMP-004**: `shouldInterruptAfterDeadline()` provides deadline-based execution interruption
- **IMP-005**: Shared package `@toolbox/js-perf-comp-core` contains execution models and worker API
- **IMP-006**: Use `import Worker from './path.ts?worker'` pattern for proper Vite bundling
- **IMP-007**: Create separate worker instances for parallel execution to prevent JIT bias

## Discoveries During Implementation

### Discovery 1: Worker Bundling Pattern

**Problem**: Using `new URL('./worker.ts', import.meta.url)` resulted in the worker being output as un-transpiled TypeScript in production builds.

**Solution**: Use Vite's `?worker` import pattern:
```typescript
// ❌ Results in .ts file with TypeScript syntax
const workerUrl = new URL('./-worker/js-perf.worker.ts', import.meta.url);
const worker = new Worker(workerUrl, { type: 'module' });

// ✅ Properly transpiled to JavaScript
import JsPerfWorker from './-worker/js-perf.worker.ts?worker';
const worker = new JsPerfWorker();
```

### Discovery 2: Parallel Execution Requires Separate Workers

**Problem**: Running both snippets in a single worker resulted in sequential execution. The second snippet benefited from JIT warmup of the first, causing unfair comparisons.

**Solution**: Create two independent worker instances:
```typescript
// Each worker has its own QuickJS runtime
const workerA = new JsPerfWorker();
const workerB = new JsPerfWorker();

// Both execute truly in parallel with independent JIT optimization
workerA.postMessage({ type: 'execute', payload: reqA });
workerB.postMessage({ type: 'execute', payload: reqB });
```

**Lesson**: Worker reuse causes JIT bias. For fair comparisons, use separate workers or re-instantiate.

### Discovery 3: JIT Warmup is Critical

**Finding**: First 3-5 runs of any code are typically 10-100x slower than subsequent runs due to JIT compilation.

**Impact**: Without warmup, benchmarks measure inconsistent optimization states.

**Solution**: See ADR-0004 for detailed warmup methodology.

## Security Considerations

| Threat                         | Mitigation                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| Access to cookies/localStorage | Worker has no DOM access; WASM runtime is isolated          |
| `fetch()` requests             | No `fetch` in Worker scope by default                       |
| DOM manipulation               | No DOM in Worker                                            |
| Infinite loops                 | `shouldInterruptAfterDeadline()` terminates after 5 seconds |
| Memory exhaustion              | Deadline also limits execution time, preventing memory bomb |
| Main thread blocking           | Worker runs in separate thread                              |

## References

- **REF-001**: [quickjs-emscripten](https://github.com/nickolasb-lab/quickjs-emscripten)
- **REF-002**: [QuickJS](https://bellard.org/quickjs/)
- **REF-003**: `packages/js-perf-comp-core/` — Execution models and worker API
- **REF-004**: `apps/toolbox-web/src/routes/tools/js-perf-comparator/-worker/` — Worker implementation
- **REF-005**: ADR-0001 — Single-App Toolbox Web Architecture
- **REF-006**: ADR-0002 — Vite + React + TanStack Platform Baseline
- **REF-007**: ADR-0004 — JavaScript Benchmarking Methodology for Consistent Results
- **REF-008**: `docs/LEARNINGS-js-perf-comparator.md` — Development log and practical lessons
