import { DiffResult, DiffEntry } from '../diff/envDiff';

const COLUMN_PAD = 2;
const KEY_MIN_WIDTH = 12;
const VAL_MIN_WIDTH = 10;

function truncate(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 3) + '...';
}

function padEnd(str: string, len: number): string {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

export interface TableOptions {
  maxValueWidth?: number;
  showUnchanged?: boolean;
  labelA?: string;
  labelB?: string;
}

export function formatTable(
  diff: DiffResult,
  options: TableOptions = {}
): string {
  const {
    maxValueWidth = 40,
    showUnchanged = false,
    labelA = 'File A',
    labelB = 'File B',
  } = options;

  const entries: DiffEntry[] = showUnchanged
    ? diff.all
    : diff.all.filter((e) => e.status !== 'unchanged');

  if (entries.length === 0) {
    return 'No differences found.';
  }

  const keyWidth = Math.max(
    KEY_MIN_WIDTH,
    ...entries.map((e) => e.key.length)
  ) + COLUMN_PAD;

  const valWidth = Math.max(
    VAL_MIN_WIDTH,
    ...entries.map((e) => Math.max(
      (e.valueA ?? '').length,
      (e.valueB ?? '').length
    ))
  );
  const cappedValWidth = Math.min(valWidth, maxValueWidth) + COLUMN_PAD;

  const statusWidth = 10;

  const header =
    padEnd('KEY', keyWidth) +
    padEnd('STATUS', statusWidth) +
    padEnd(labelA, cappedValWidth) +
    labelB;

  const separator = '-'.repeat(header.length);

  const rows = entries.map((entry) => {
    const valA = entry.valueA !== undefined ? truncate(entry.valueA, maxValueWidth) : '(missing)';
    const valB = entry.valueB !== undefined ? truncate(entry.valueB, maxValueWidth) : '(missing)';
    return (
      padEnd(entry.key, keyWidth) +
      padEnd(entry.status, statusWidth) +
      padEnd(valA, cappedValWidth) +
      valB
    );
  });

  return [header, separator, ...rows].join('\n');
}
