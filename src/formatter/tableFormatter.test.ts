import { formatTable } from './tableFormatter';
import { DiffResult } from '../diff/envDiff';

function makeDiff(entries: DiffResult['all']): DiffResult {
  return {
    all: entries,
    added: entries.filter((e) => e.status === 'added'),
    removed: entries.filter((e) => e.status === 'removed'),
    changed: entries.filter((e) => e.status === 'changed'),
    unchanged: entries.filter((e) => e.status === 'unchanged'),
  };
}

describe('formatTable', () => {
  it('returns no-diff message when all entries are unchanged and showUnchanged is false', () => {
    const diff = makeDiff([
      { key: 'PORT', status: 'unchanged', valueA: '3000', valueB: '3000' },
    ]);
    expect(formatTable(diff)).toBe('No differences found.');
  });

  it('includes header row with default labels', () => {
    const diff = makeDiff([
      { key: 'PORT', status: 'added', valueA: undefined, valueB: '3000' },
    ]);
    const output = formatTable(diff);
    expect(output).toContain('KEY');
    expect(output).toContain('STATUS');
    expect(output).toContain('File A');
    expect(output).toContain('File B');
  });

  it('uses custom labels when provided', () => {
    const diff = makeDiff([
      { key: 'DB', status: 'changed', valueA: 'old', valueB: 'new' },
    ]);
    const output = formatTable(diff, { labelA: 'staging', labelB: 'prod' });
    expect(output).toContain('staging');
    expect(output).toContain('prod');
  });

  it('shows added entry with (missing) for valueA', () => {
    const diff = makeDiff([
      { key: 'NEW_KEY', status: 'added', valueA: undefined, valueB: 'hello' },
    ]);
    const output = formatTable(diff);
    expect(output).toContain('(missing)');
    expect(output).toContain('hello');
    expect(output).toContain('added');
  });

  it('truncates long values', () => {
    const longVal = 'x'.repeat(60);
    const diff = makeDiff([
      { key: 'SECRET', status: 'changed', valueA: longVal, valueB: 'short' },
    ]);
    const output = formatTable(diff, { maxValueWidth: 20 });
    expect(output).toContain('...');
  });

  it('shows unchanged entries when showUnchanged is true', () => {
    const diff = makeDiff([
      { key: 'PORT', status: 'unchanged', valueA: '3000', valueB: '3000' },
    ]);
    const output = formatTable(diff, { showUnchanged: true });
    expect(output).toContain('PORT');
    expect(output).toContain('unchanged');
  });

  it('includes a separator line', () => {
    const diff = makeDiff([
      { key: 'HOST', status: 'removed', valueA: 'localhost', valueB: undefined },
    ]);
    const lines = formatTable(diff).split('\n');
    const separatorLine = lines[1];
    expect(separatorLine).toMatch(/^-+$/);
  });
});
