export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  baseValue?: string;
  targetValue?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export function diffEnvMaps(
  base: Map<string, string>,
  target: Map<string, string>
): DiffResult {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...base.keys(), ...target.keys()]);

  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;

  for (const key of [...allKeys].sort()) {
    const baseValue = base.get(key);
    const targetValue = target.get(key);

    if (baseValue === undefined && targetValue !== undefined) {
      entries.push({ key, status: 'added', targetValue });
      added++;
    } else if (baseValue !== undefined && targetValue === undefined) {
      entries.push({ key, status: 'removed', baseValue });
      removed++;
    } else if (baseValue !== targetValue) {
      entries.push({ key, status: 'changed', baseValue, targetValue });
      changed++;
    } else {
      entries.push({ key, status: 'unchanged', baseValue, targetValue });
      unchanged++;
    }
  }

  return { entries, added, removed, changed, unchanged };
}

export function filterDiff(
  result: DiffResult,
  statuses: DiffStatus[]
): DiffResult {
  const entries = result.entries.filter((e) => statuses.includes(e.status));
  return {
    entries,
    added: entries.filter((e) => e.status === 'added').length,
    removed: entries.filter((e) => e.status === 'removed').length,
    changed: entries.filter((e) => e.status === 'changed').length,
    unchanged: entries.filter((e) => e.status === 'unchanged').length,
  };
}
