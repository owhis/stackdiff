import { summarizeDiff, formatSummary, ReportSummary } from './envReporter';
import { DiffResult } from '../diff/envDiff';

const makeDiff = (overrides: Partial<DiffResult>[]): DiffResult[] =>
  overrides.map((o) => ({ key: 'KEY', leftValue: undefined, rightValue: undefined, status: 'unchanged', ...o }));

describe('summarizeDiff', () => {
  it('counts each status correctly', () => {
    const diff = makeDiff([
      { key: 'A', status: 'added', rightValue: '1' },
      { key: 'B', status: 'removed', leftValue: '2' },
      { key: 'C', status: 'changed', leftValue: 'old', rightValue: 'new' },
      { key: 'D', status: 'unchanged', leftValue: 'x', rightValue: 'x' },
    ]);

    const summary = summarizeDiff(diff);
    expect(summary.totalKeys).toBe(4);
    expect(summary.addedCount).toBe(1);
    expect(summary.removedCount).toBe(1);
    expect(summary.changedCount).toBe(1);
    expect(summary.unchangedCount).toBe(1);
  });

  it('tracks missingInLeft for added keys', () => {
    const diff = makeDiff([{ key: 'NEW_KEY', status: 'added', rightValue: 'val' }]);
    const summary = summarizeDiff(diff);
    expect(summary.missingInLeft).toContain('NEW_KEY');
    expect(summary.missingInRight).toHaveLength(0);
  });

  it('tracks missingInRight for removed keys', () => {
    const diff = makeDiff([{ key: 'OLD_KEY', status: 'removed', leftValue: 'val' }]);
    const summary = summarizeDiff(diff);
    expect(summary.missingInRight).toContain('OLD_KEY');
    expect(summary.missingInLeft).toHaveLength(0);
  });

  it('returns zero counts for empty diff', () => {
    const summary = summarizeDiff([]);
    expect(summary.totalKeys).toBe(0);
    expect(summary.addedCount).toBe(0);
  });
});

describe('formatSummary', () => {
  it('includes all count fields', () => {
    const summary: ReportSummary = {
      totalKeys: 5,
      addedCount: 1,
      removedCount: 2,
      changedCount: 1,
      unchangedCount: 1,
      missingInLeft: ['FOO'],
      missingInRight: ['BAR', 'BAZ'],
    };
    const output = formatSummary(summary);
    expect(output).toContain('Total keys   : 5');
    expect(output).toContain('Added        : 1');
    expect(output).toContain('Missing in left  : FOO');
    expect(output).toContain('Missing in right : BAR, BAZ');
  });

  it('omits missing sections when empty', () => {
    const summary: ReportSummary = {
      totalKeys: 2,
      addedCount: 0,
      removedCount: 0,
      changedCount: 1,
      unchangedCount: 1,
      missingInLeft: [],
      missingInRight: [],
    };
    const output = formatSummary(summary);
    expect(output).not.toContain('Missing in left');
    expect(output).not.toContain('Missing in right');
  });
});
