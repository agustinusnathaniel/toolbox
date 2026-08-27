import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';

export interface CronParseResult {
  error?: string;
  humanReadable?: string;
  isValid: boolean;
  nextRuns?: Array<string>;
}

export interface ParseCronOptions {
  count?: number;
  tz?: string;
}

export const CRON_EXAMPLES: Array<{ description: string; expression: string }> =
  [
    { description: 'Every minute', expression: '* * * * *' },
    { description: 'Every hour', expression: '0 * * * *' },
    { description: 'Daily at midnight', expression: '0 0 * * *' },
    { description: 'Every 5 minutes', expression: '*/5 * * * *' },
    { description: 'Mondays at 9 AM', expression: '0 9 * * 1' },
    { description: 'First day of month', expression: '0 0 1 * *' },
  ];

export function parseCronExpression(
  expression: string,
  options: ParseCronOptions = {}
): CronParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { error: 'Enter a cron expression', isValid: false };
  }

  const count = options.count ?? 5;

  try {
    const interval = CronExpressionParser.parse(trimmed, {
      tz: options.tz ?? undefined,
    });

    const nextRuns: Array<string> = [];
    for (let i = 0; i < count; i++) {
      try {
        const next = interval.next();
        const iso = next.toISOString() ?? next.toDate().toISOString();
        nextRuns.push(iso);
      } catch {
        break;
      }
    }

    let humanReadable: string;
    try {
      humanReadable = cronstrue.toString(trimmed);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to describe expression',
        isValid: false,
      };
    }

    return {
      humanReadable,
      isValid: true,
      nextRuns,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid cron expression',
      isValid: false,
    };
  }
}
