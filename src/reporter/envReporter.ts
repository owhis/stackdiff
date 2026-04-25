import { DiffResult } from '../diff/envDiff';

export interface ReportSummary {
  totalKeys: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  missingInLeft: string[];
  missingInRight: string[];
}

export function summarizeDiff(diff: DiffResult[]): ReportSummary {
  const summary: ReportSummary = {
    totalKeys: diff.length,
    addedCount: 0,
    removedCount: 0,
    changedCount: 0,
    unchangedCount: 0,
    missingInLeft: [],
    missingInRight: [],
  };

  for (const entry of diff) {
    switch (entry.status) {
      case 'added':
        summary.addedCount++;
        summary.missingInLeft.push(entry.key);
        break;
      case 'removed':
        summary.removedCount++;
        summary.missingInRight.push(entry.key);
        break;
      case 'changed':
        summary.changedCount++;
        break;
      case 'unchanged':
        summary.unchangedCount++;
        break;
    }
  }

  return summary;
}

export function formatSummary(summary: ReportSummary): string {
  const lines: string[] = [
    '─── Diff Summary ───────────────────────────',
    `  Total keys   : ${summary.totalKeys}`,
    `  Added        : ${summary.addedCount}`,
    `  Removed      : ${summary.removedCount}`,
    `  Changed      : ${summary.changedCount}`,
    `  Unchanged    : ${summary.unchangedCount}`,
    '────────────────────────────────────────────',
  ];

  if (summary.missingInLeft.length > 0) {
    lines.push(`  Missing in left  : ${summary.missingInLeft.join(', ')}`);
  }
  if (summary.missingInRight.length > 0) {
    lines.push(`  Missing in right : ${summary.missingInRight.join(', ')}`);
  }

  return lines.join('\n');
}
