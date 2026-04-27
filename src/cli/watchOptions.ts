export type WatchMode = 'poll' | 'native';

export interface WatchOptions {
  enabled: boolean;
  intervalMs: number;
  mode: WatchMode;
  clearOnChange: boolean;
}

const DEFAULT_INTERVAL_MS = 1000;
const VALID_MODES: WatchMode[] = ['poll', 'native'];

export function parseWatchMode(value: string | undefined): WatchMode {
  if (value === undefined) return 'native';
  if (VALID_MODES.includes(value as WatchMode)) return value as WatchMode;
  throw new Error(`Invalid watch mode: "${value}". Must be one of: ${VALID_MODES.join(', ')}`);
}

export function parseWatchInterval(value: string | number | undefined): number {
  if (value === undefined) return DEFAULT_INTERVAL_MS;
  const ms = typeof value === 'number' ? value : parseInt(value, 10);
  if (isNaN(ms) || ms <= 0) {
    throw new Error(`Invalid watch interval: "${value}". Must be a positive integer (milliseconds).`);
  }
  return ms;
}

export function parseWatchOptions(args: Record<string, unknown>): WatchOptions {
  return {
    enabled: Boolean(args.watch ?? false),
    intervalMs: parseWatchInterval(args.watchInterval as string | number | undefined),
    mode: parseWatchMode(args.watchMode as string | undefined),
    clearOnChange: Boolean(args.clearOnChange ?? true),
  };
}
