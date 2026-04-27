import { DiffOptions } from '../diff';

export type ShowMode = 'all' | 'changed' | 'added' | 'removed' | 'unchanged';

export interface ParsedDiffOptions {
  show: ShowMode;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

const VALID_SHOW_MODES: ShowMode[] = ['all', 'changed', 'added', 'removed', 'unchanged'];

export function parseShowMode(value: unknown): ShowMode {
  if (typeof value !== 'string') return 'all';
  const normalized = value.toLowerCase() as ShowMode;
  if (VALID_SHOW_MODES.includes(normalized)) return normalized;
  throw new Error(
    `Invalid --show value: "${value}". Must be one of: ${VALID_SHOW_MODES.join(', ')}`
  );
}

export function parseIgnoreCase(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return false;
}

export function parseIgnoreWhitespace(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return false;
}

export function parseDiffOptions(argv: Record<string, unknown>): ParsedDiffOptions {
  return {
    show: parseShowMode(argv['show'] ?? 'all'),
    ignoreCase: parseIgnoreCase(argv['ignore-case'] ?? false),
    ignoreWhitespace: parseIgnoreWhitespace(argv['ignore-whitespace'] ?? false),
  };
}

export function toDiffOptions(opts: ParsedDiffOptions): Partial<DiffOptions> {
  return {
    ignoreCase: opts.ignoreCase,
    ignoreWhitespace: opts.ignoreWhitespace,
  };
}
