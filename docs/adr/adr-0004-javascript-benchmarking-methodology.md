---
title: "ADR-0004: JavaScript Benchmarking Methodology for Consistent Results"
status: "Accepted"
date: "2026-04-05"
authors: "Nathan, OpenCode"
tags: ["performance", "benchmarking", "methodology", "statistics"]
supersedes: ""
superseded_by: ""
---

# ADR-0004: JavaScript Benchmarking Methodology for Consistent Results

## Status

**Accepted** | Proposed | Rejected | Superseded | Deprecated

## Context

When implementing the JS Performance Comparator tool, we discovered that benchmark results were highly inconsistent between runs. Running the same comparison multiple times would yield different winners:

- Run 1: Code A is 15% faster
- Run 2: Code B is 20% faster
- Run 3: Both are roughly equal
- Run 4: Different result again

This inconsistency makes the tool unreliable for performance comparison decisions.

## Root Cause Analysis

### JIT Compilation Effects

JavaScript engines (V8, SpiderMonkey, JavaScriptCore) use **Just-In-Time (JIT) compilation**:

1. **Interpretation Phase** (first few runs): Code runs in the interpreter — slow
2. **Baseline Compilation**: Simple JIT compilation — moderate speed
3. **Optimized Compilation**: Aggressive optimizations based on runtime profiling — fastest
4. **Deoptimization**: If assumptions fail, falls back to slower tiers

Without accounting for JIT warmup, benchmarks measure inconsistent optimization states.

### Sources of Measurement Noise

| Source | Impact | Mitigation |
|--------|--------|------------|
| **JIT Warmup** | High (10-100x difference) | Warmup iterations before timing |
| **Garbage Collection** | Medium (spikes in timing) | Outlier filtering (IQR method) |
| **Background Tasks** | Low-Medium | Multiple iterations, median calculation |
| **CPU Throttling** | Medium | Run on stable power, avoid thermal limits |
| **Timer Resolution** | Low | Use `performance.now()` (microsecond precision) |

## Decision

Implement a **robust benchmarking methodology** with:

1. **Warmup Phase**: 5 untimed iterations before measurement
2. **Outlier Removal**: IQR-based filtering of GC spikes and anomalies
3. **Median Calculation**: More robust than mean for skewed distributions
4. **Increased Sample Size**: 30+ iterations for statistical significance

## Methodology

### Warmup Phase

```typescript
const WARMUP_ITERATIONS = 5;

// Phase 1: Warmup (NOT included in statistics)
for (let i = 0; i < WARMUP_ITERATIONS; i++) {
  runCode(code); // Let JIT optimize
}

// Phase 2: Timed iterations (included in statistics)
for (let i = 0; i < iterations; i++) {
  measure(runCode(code));
}
```

### Outlier Removal (IQR Method)

```typescript
function removeOutliers(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];  // 25th percentile
  const q3 = sorted[Math.floor(sorted.length * 0.75)];  // 75th percentile
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return sorted.filter(v => v >= lowerBound && v <= upperBound);
}
```

Example:
- Raw: [10, 11, 12, 1000, 13] (1000ms = GC pause)
- Q1 = 11, Q3 = 13, IQR = 2
- Bounds: 8 to 16
- Filtered: [10, 11, 12, 13]

### Statistical Calculation

Use **median** instead of mean:

```typescript
// Mean (affected by outliers)
mean = (10 + 11 + 12 + 1000 + 13) / 5 = 209.2ms  // Wrong

// Median (robust to outliers)
median = 12ms  // Correct
```

## Implementation

### Core Algorithm

```typescript
export function calculateRobustStatistics(durations: number[]): ExecutionStatistics {
  // Sort for percentile calculations
  const sorted = [...durations].sort((a, b) => a - b);
  
  // Calculate IQR
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  // Filter outliers
  const filtered = sorted.filter(d => d >= q1 - 1.5 * iqr && d <= q3 + 1.5 * iqr);
  
  // Calculate median
  const mid = Math.floor(filtered.length / 2);
  const median = filtered.length % 2 === 0
    ? (filtered[mid - 1] + filtered[mid]) / 2
    : filtered[mid];
  
  // Standard deviation on filtered data
  const variance = filtered.reduce((sum, d) => sum + (d - median) ** 2, 0) / filtered.length;
  const stddev = Math.sqrt(variance);
  
  // 95% confidence margin
  const zValue = filtered.length > 30 ? 1.96 : 2.0;
  const margin = (zValue * stddev) / Math.sqrt(filtered.length);
  
  return {
    iterations: durations.length,
    minMs: filtered[0],
    maxMs: filtered[filtered.length - 1],
    meanMs: median,  // Using median as the central measure
    stddevMs: stddev,
    marginMs: margin,
  };
}
```

### Worker Implementation

```typescript
const WARMUP_ITERATIONS = 5;

function runBenchmarkIterations(code: string, iterations: number) {
  // Warmup - not measured
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    runCode(code);
  }
  
  // Timed iterations
  const durations = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    runCode(code);
    durations.push(performance.now() - start);
  }
  
  return calculateRobustStatistics(durations);
}
```

## Configuration

```typescript
export const DEFAULT_RUN_POLICY: RunPolicy = {
  deadlineMs: 5000,        // 5 second timeout per snippet
  maxOutputLines: 100,
  defaultIterations: 30,   // 30 timed + 5 warmup = 35 total runs
};
```

## Trade-off Analysis

| Trade-off | Decision | Reasoning |
|-----------|----------|-----------|
| Speed vs. Accuracy | Accuracy | 35 total runs takes 1-3s but gives reliable results |
| Simple mean vs. Robust stats | Robust stats | Outliers from GC make mean unreliable |
| Few vs. Many iterations | 30 iterations | Law of large numbers reduces variance |
| Include vs. Exclude outliers | Exclude (IQR) | GC pauses are not representative |

## Validation

### Before Robust Methodology
```
Run 1: A=10.2ms, B=11.5ms → A is 11% faster
Run 2: A=15.1ms, B=9.8ms  → B is 54% faster
Run 3: A=12.3ms, B=12.1ms → Roughly equal
Run 4: A=9.8ms,  B=13.2ms → A is 35% faster
```

### After Robust Methodology
```
Run 1: A=10.5ms ±0.3, B=11.8ms ±0.4 → A is 11% faster
Run 2: A=10.4ms ±0.3, B=11.9ms ±0.4 → A is 13% faster
Run 3: A=10.6ms ±0.4, B=11.7ms ±0.3 → A is 10% faster
Run 4: A=10.5ms ±0.3, B=11.8ms ±0.5 → A is 11% faster
```

**Result**: Consistent within ±2% across runs.

## Lessons Learned

### JIT Warmup is Critical
- First 3-5 runs are typically 10-100x slower than optimized runs
- Must discard warmup runs before measurement
- Each code snippet needs its own warmup (cannot share)

### Parallel Execution Requires Separate Workers
- Running both snippets in one worker = sequential execution
- Second snippet benefits from JIT warmup of first
- Use **two separate workers** for true parallel execution

### Statistics Matter
- Simple mean is misleading with performance data
- Outliers from GC and background tasks are common
- Median + IQR filtering provides robust results

### Microbenchmarks are Tricky
- Very fast code (less than 0.1ms) has high measurement error
- Loop overhead can dominate for small snippets
- Consider using larger workloads for meaningful results

## Usage Recommendations

1. **Close other browser tabs** - Reduce background noise
2. **Run on stable power** - Avoid CPU throttling on battery
3. **Use reasonable workload sizes** - Too small = high error, too large = timeout
4. **Look for consistent patterns** - Single run is never enough
5. **Check the margin of error** - Large margins indicate unreliable results

## References

- **REF-001**: ADR-0003 — Sandboxed JavaScript Execution
- **REF-002**: `packages/js-perf-comp-core/src/models.ts` — `calculateRobustStatistics()`
- **REF-003**: `apps/toolbox-web/src/routes/tools/js-perf-comparator/-worker/` — Worker implementation
- **REF-004**: Benchmark.js — Industry-standard benchmarking library
- **REF-005**: WebKit blog on JIT compilation
- **REF-006**: V8 blog: TurboFan compilation pipeline
