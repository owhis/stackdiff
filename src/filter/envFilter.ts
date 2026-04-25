/**
 * envFilter.ts
 * Utilities for filtering diff results by key patterns or diff status.
 */

import { DiffEntry, DiffStatus } from '../diff/envDiff';

export interface FilterOptions {
  /** Only include keys matching this glob-style prefix or substring */
  keyPattern?: string;
  /** Only include entries with these statuses */
  statuses?: DiffStatus[];
  /** Exclude keys matching this pattern */
  excludePattern?: string;
}

/**
 * Returns true if the key matches a simple wildcard pattern.
 * Supports leading/trailing `*` wildcards.
 */
export function matchesPattern(key: string, pattern: string): boolean {
  if (pattern.startsWith('*') && pattern.endsWith('*')) {
    return key.includes(pattern.slice(1, -1));
  }
  if (pattern.startsWith('*')) {
    return key.endsWith(pattern.slice(1));
  }
  if (pattern.endsWith('*')) {
    return key.startsWith(pattern.slice(0, -1));
  }
  return key === pattern;
}

/**
 * Filters an array of DiffEntry objects according to the provided options.
 */
export function filterEntries(
  entries: DiffEntry[],
  options: FilterOptions
): DiffEntry[] {
  return entries.filter((entry) => {
    if (
      options.statuses &&
      options.statuses.length > 0 &&
      !options.statuses.includes(entry.status)
    ) {
      return false;
    }

    if (
      options.keyPattern &&
      !matchesPattern(entry.key, options.keyPattern)
    ) {
      return false;
    }

    if (
      options.excludePattern &&
      matchesPattern(entry.key, options.excludePattern)
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Convenience: filter entries to only those that differ (added, removed, changed).
 */
export function filterChanged(entries: DiffEntry[]): DiffEntry[] {
  return filterEntries(entries, { statuses: ['added', 'removed', 'changed'] });
}
