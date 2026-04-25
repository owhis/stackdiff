import { matchesPattern, filterEntries, filterChanged } from './envFilter';
import { DiffEntry } from '../diff/envDiff';

function makeEntry(
  key: string,
  status: DiffEntry['status'],
  left?: string,
  right?: string
): DiffEntry {
  return { key, status, left, right };
}

describe('matchesPattern', () => {
  it('matches exact key', () => {
    expect(matchesPattern('DB_HOST', 'DB_HOST')).toBe(true);
    expect(matchesPattern('DB_HOST', 'DB_PORT')).toBe(false);
  });

  it('matches prefix wildcard', () => {
    expect(matchesPattern('DB_HOST', 'DB_*')).toBe(true);
    expect(matchesPattern('API_KEY', 'DB_*')).toBe(false);
  });

  it('matches suffix wildcard', () => {
    expect(matchesPattern('DB_HOST', '*_HOST')).toBe(true);
    expect(matchesPattern('DB_PORT', '*_HOST')).toBe(false);
  });

  it('matches substring wildcard', () => {
    expect(matchesPattern('DB_HOST_NAME', '*HOST*')).toBe(true);
    expect(matchesPattern('API_KEY', '*HOST*')).toBe(false);
  });
});

describe('filterEntries', () => {
  const entries: DiffEntry[] = [
    makeEntry('DB_HOST', 'changed', 'localhost', 'prod.db'),
    makeEntry('DB_PORT', 'unchanged', '5432', '5432'),
    makeEntry('API_KEY', 'added', undefined, 'secret'),
    makeEntry('OLD_FLAG', 'removed', 'true', undefined),
    makeEntry('DB_NAME', 'changed', 'dev', 'prod'),
  ];

  it('filters by status', () => {
    const result = filterEntries(entries, { statuses: ['added', 'removed'] });
    expect(result.map((e) => e.key)).toEqual(['API_KEY', 'OLD_FLAG']);
  });

  it('filters by key pattern', () => {
    const result = filterEntries(entries, { keyPattern: 'DB_*' });
    expect(result.map((e) => e.key)).toEqual(['DB_HOST', 'DB_PORT', 'DB_NAME']);
  });

  it('excludes by pattern', () => {
    const result = filterEntries(entries, { excludePattern: 'DB_*' });
    expect(result.map((e) => e.key)).toEqual(['API_KEY', 'OLD_FLAG']);
  });

  it('combines status and key pattern', () => {
    const result = filterEntries(entries, {
      statuses: ['changed'],
      keyPattern: 'DB_*',
    });
    expect(result.map((e) => e.key)).toEqual(['DB_HOST', 'DB_NAME']);
  });

  it('returns all entries when no options given', () => {
    expect(filterEntries(entries, {})).toHaveLength(entries.length);
  });
});

describe('filterChanged', () => {
  it('returns only non-unchanged entries', () => {
    const entries: DiffEntry[] = [
      makeEntry('A', 'unchanged', 'x', 'x'),
      makeEntry('B', 'added', undefined, 'y'),
      makeEntry('C', 'removed', 'z', undefined),
      makeEntry('D', 'changed', '1', '2'),
    ];
    const result = filterChanged(entries);
    expect(result.map((e) => e.key)).toEqual(['B', 'C', 'D']);
  });
});
