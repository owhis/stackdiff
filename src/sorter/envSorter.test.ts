import { sortEntries, sortByKey, sortByStatus } from './envSorter';
import { DiffEntry } from '../diff/envDiff';

function makeEntry(key: string, status: DiffEntry['status'], left = '', right = ''): DiffEntry {
  return { key, status, leftValue: left, rightValue: right };
}

describe('sortByKey', () => {
  it('sorts entries alphabetically ascending', () => {
    const entries = [makeEntry('ZEBRA', 'unchanged'), makeEntry('ALPHA', 'added'), makeEntry('MANGO', 'removed')];
    const sorted = sortByKey(entries);
    expect(sorted.map(e => e.key)).toEqual(['ALPHA', 'MANGO', 'ZEBRA']);
  });

  it('sorts entries alphabetically descending', () => {
    const entries = [makeEntry('ALPHA', 'unchanged'), makeEntry('ZEBRA', 'added')];
    const sorted = sortByKey(entries, 'desc');
    expect(sorted.map(e => e.key)).toEqual(['ZEBRA', 'ALPHA']);
  });

  it('does not mutate the original array', () => {
    const entries = [makeEntry('B', 'added'), makeEntry('A', 'removed')];
    const original = [...entries];
    sortByKey(entries);
    expect(entries).toEqual(original);
  });
});

describe('sortByStatus', () => {
  it('sorts by default priority: added, removed, changed, unchanged', () => {
    const entries = [
      makeEntry('D', 'unchanged'),
      makeEntry('C', 'changed'),
      makeEntry('B', 'removed'),
      makeEntry('A', 'added'),
    ];
    const sorted = sortByStatus(entries);
    expect(sorted.map(e => e.status)).toEqual(['added', 'removed', 'changed', 'unchanged']);
  });

  it('respects custom priority order', () => {
    const entries = [makeEntry('A', 'added'), makeEntry('B', 'unchanged'), makeEntry('C', 'changed')];
    const sorted = sortByStatus(entries, ['unchanged', 'changed', 'added']);
    expect(sorted.map(e => e.status)).toEqual(['unchanged', 'changed', 'added']);
  });
});

describe('sortEntries', () => {
  it('sorts by leftValue ascending', () => {
    const entries = [
      makeEntry('B', 'changed', 'zebra'),
      makeEntry('A', 'changed', 'apple'),
    ];
    const sorted = sortEntries(entries, { field: 'leftValue' });
    expect(sorted.map(e => e.leftValue)).toEqual(['apple', 'zebra']);
  });

  it('returns empty array for empty input', () => {
    expect(sortEntries([], { field: 'key' })).toEqual([]);
  });
});
