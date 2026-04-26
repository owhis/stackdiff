/**
 * envSorter.ts
 * Utilities for sorting diff entries by key, status, or custom order.
 */

import { DiffEntry } from '../diff/envDiff';

export type SortField = 'key' | 'status' | 'leftValue' | 'rightValue';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order?: SortOrder;
  statusPriority?: string[];
}

const DEFAULT_STATUS_PRIORITY = ['added', 'removed', 'changed', 'unchanged'];

export function sortEntries(
  entries: DiffEntry[],
  options: SortOptions
): DiffEntry[] {
  const { field, order = 'asc', statusPriority = DEFAULT_STATUS_PRIORITY } = options;

  return [...entries].sort((a, b) => {
    let cmp = 0;

    if (field === 'status') {
      const ai = statusPriority.indexOf(a.status);
      const bi = statusPriority.indexOf(b.status);
      cmp = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    } else {
      const av = (a[field] ?? '').toString().toLowerCase();
      const bv = (b[field] ?? '').toString().toLowerCase();
      cmp = av.localeCompare(bv);
    }

    return order === 'desc' ? -cmp : cmp;
  });
}

export function sortByKey(entries: DiffEntry[], order: SortOrder = 'asc'): DiffEntry[] {
  return sortEntries(entries, { field: 'key', order });
}

export function sortByStatus(
  entries: DiffEntry[],
  priority: string[] = DEFAULT_STATUS_PRIORITY
): DiffEntry[] {
  return sortEntries(entries, { field: 'status', statusPriority: priority });
}
