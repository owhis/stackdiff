import { diffEnvMaps, filterDiff, DiffResult } from './envDiff';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('diffEnvMaps', () => {
  it('detects added keys', () => {
    const base = makeMap({ A: '1' });
    const target = makeMap({ A: '1', B: '2' });
    const result = diffEnvMaps(base, target);
    expect(result.added).toBe(1);
    expect(result.entries.find((e) => e.key === 'B')?.status).toBe('added');
  });

  it('detects removed keys', () => {
    const base = makeMap({ A: '1', B: '2' });
    const target = makeMap({ A: '1' });
    const result = diffEnvMaps(base, target);
    expect(result.removed).toBe(1);
    expect(result.entries.find((e) => e.key === 'B')?.status).toBe('removed');
  });

  it('detects changed values', () => {
    const base = makeMap({ A: 'old' });
    const target = makeMap({ A: 'new' });
    const result = diffEnvMaps(base, target);
    expect(result.changed).toBe(1);
    const entry = result.entries.find((e) => e.key === 'A')!;
    expect(entry.baseValue).toBe('old');
    expect(entry.targetValue).toBe('new');
  });

  it('detects unchanged values', () => {
    const base = makeMap({ A: '1' });
    const target = makeMap({ A: '1' });
    const result = diffEnvMaps(base, target);
    expect(result.unchanged).toBe(1);
    expect(result.entries[0].status).toBe('unchanged');
  });

  it('returns keys sorted alphabetically', () => {
    const base = makeMap({ Z: '1', A: '2', M: '3' });
    const target = makeMap({ Z: '1', A: '2', M: '3' });
    const result = diffEnvMaps(base, target);
    expect(result.entries.map((e) => e.key)).toEqual(['A', 'M', 'Z']);
  });

  it('handles empty maps', () => {
    const result = diffEnvMaps(new Map(), new Map());
    expect(result.entries).toHaveLength(0);
    expect(result.added + result.removed + result.changed + result.unchanged).toBe(0);
  });
});

describe('filterDiff', () => {
  let result: DiffResult;

  beforeEach(() => {
    const base = makeMap({ A: '1', B: 'old', C: 'same' });
    const target = makeMap({ B: 'new', C: 'same', D: 'added' });
    result = diffEnvMaps(base, target);
  });

  it('filters to only changed entries', () => {
    const filtered = filterDiff(result, ['changed']);
    expect(filtered.changed).toBe(1);
    expect(filtered.added).toBe(0);
    expect(filtered.removed).toBe(0);
  });

  it('filters to multiple statuses', () => {
    const filtered = filterDiff(result, ['added', 'removed']);
    expect(filtered.added).toBe(1);
    expect(filtered.removed).toBe(1);
    expect(filtered.unchanged).toBe(0);
  });
});
