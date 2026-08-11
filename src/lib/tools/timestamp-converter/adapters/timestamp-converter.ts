export interface TimestampResult {
  /** Epoch milliseconds, when input parsed as a date string */
  epochMillis?: string;
  /** Epoch seconds, when input parsed as a date string */
  epochSeconds?: string;
  error?: string;
  /** ISO 8601 UTC string */
  iso?: string;
  isValid: boolean;
  /** Local timezone formatted string */
  local?: string;
  /** Relative time like "3 hours ago" or "in 2 days" */
  relative?: string;
  /** UTC formatted string */
  utc?: string;
}

const MAX_SAFE_EPOCH_MS = 8.64e15; // year 275760, Date max
const MIN_SAFE_EPOCH_MS = -8.64e15;

const NEGATIVE_PREFIX = /^-/;
const DIGITS_ONLY = /^\d+$/;

/** Largest-to-smallest relative units, used to pick the display unit. */
const RELATIVE_UNITS: ReadonlyArray<{ label: string; ms: number }> = [
  { label: 'year', ms: 31_557_600_000 },
  { label: 'month', ms: 2_629_746_000 },
  { label: 'week', ms: 604_800_000 },
  { label: 'day', ms: 86_400_000 },
  { label: 'hour', ms: 3_600_000 },
  { label: 'minute', ms: 60_000 },
  { label: 'second', ms: 1000 },
];

function isValidEpochMs(ms: number): boolean {
  return (
    Number.isFinite(ms) && ms >= MIN_SAFE_EPOCH_MS && ms <= MAX_SAFE_EPOCH_MS
  );
}

function formatRelative(ms: number, now: number): string {
  const diff = ms - now;
  const abs = Math.abs(diff);

  if (abs < 1000) {
    return 'just now';
  }

  // `find` always matches: the `abs < 1000` early return guarantees at
  // least the `second` entry (1000ms) satisfies the predicate. The [0]
  // fallback is unreachable but satisfies the type checker without a
  // non-null assertion.
  const unit =
    RELATIVE_UNITS.find((entry) => abs >= entry.ms) ?? RELATIVE_UNITS[0];
  const count = Math.round(abs / unit.ms);
  const quantity = `${count} ${unit.label}${count === 1 ? '' : 's'}`;

  return diff >= 0 ? `in ${quantity}` : `${quantity} ago`;
}

/**
 * Convert a raw input string to a timestamp result.
 * Accepts: numeric epoch (seconds or milliseconds, auto-detected by digit count),
 * or a date string parseable by `new Date()`.
 */
export function convertTimestamp(
  raw: string,
  now: number = Date.now()
): TimestampResult {
  const input = raw.trim();
  if (!input) {
    return { error: 'Input is empty', isValid: false };
  }

  const numeric = input.replace(NEGATIVE_PREFIX, '');
  if (DIGITS_ONLY.test(numeric)) {
    // Auto-detect: 13+ digits = milliseconds, 10 digits = seconds.
    // Anything else (11-12 digits, or a date-like number) falls through to Date.parse.
    if (numeric.length === 13) {
      const ms = Number(input);
      if (!isValidEpochMs(ms)) {
        return { error: 'Timestamp is out of range', isValid: false };
      }
      const date = new Date(ms);
      return {
        epochMillis: String(ms),
        epochSeconds: String(Math.floor(ms / 1000)),
        iso: date.toISOString(),
        isValid: true,
        local: date.toLocaleString(),
        relative: formatRelative(ms, now),
        utc: date.toUTCString(),
      };
    }
    if (numeric.length === 10) {
      const seconds = Number(input);
      const ms = seconds * 1000;
      if (!isValidEpochMs(ms)) {
        return { error: 'Timestamp is out of range', isValid: false };
      }
      const date = new Date(ms);
      return {
        epochMillis: String(ms),
        epochSeconds: String(seconds),
        iso: date.toISOString(),
        isValid: true,
        local: date.toLocaleString(),
        relative: formatRelative(ms, now),
        utc: date.toUTCString(),
      };
    }
  }

  // Fall back to date-string parsing.
  const parsed = Date.parse(input);
  if (!Number.isFinite(parsed)) {
    return {
      error:
        'Could not parse input as a Unix timestamp (10 or 13 digits) or a date string.',
      isValid: false,
    };
  }
  if (!isValidEpochMs(parsed)) {
    return { error: 'Timestamp is out of range', isValid: false };
  }
  const date = new Date(parsed);
  return {
    epochMillis: String(parsed),
    epochSeconds: String(Math.floor(parsed / 1000)),
    iso: date.toISOString(),
    isValid: true,
    local: date.toLocaleString(),
    relative: formatRelative(parsed, now),
    utc: date.toUTCString(),
  };
}
