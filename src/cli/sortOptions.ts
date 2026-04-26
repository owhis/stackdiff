/**
 * sortOptions.ts
 * Parses and validates CLI sort-related flags for stackdiff.
 */

import { SortField, SortOrder } from '../sorter/envSorter';

export interface ParsedSortOptions {
  field: SortField;
  order: SortOrder;
}

const VALID_FIELDS: SortField[] = ['key', 'status', 'leftValue', 'rightValue'];
const VALID_ORDERS: SortOrder[] = ['asc', 'desc'];

export function parseSortField(raw: string | undefined): SortField {
  if (!raw) return 'key';
  const normalized = raw.toLowerCase() as SortField;
  if (!VALID_FIELDS.includes(normalized)) {
    throw new Error(
      `Invalid sort field "${raw}". Valid options: ${VALID_FIELDS.join(', ')}`
    );
  }
  return normalized;
}

export function parseSortOrder(raw: string | undefined): SortOrder {
  if (!raw) return 'asc';
  const normalized = raw.toLowerCase() as SortOrder;
  if (!VALID_ORDERS.includes(normalized)) {
    throw new Error(
      `Invalid sort order "${raw}". Valid options: ${VALID_ORDERS.join(', ')}`
    );
  }
  return normalized;
}

export function parseSortOptions(
  field: string | undefined,
  order: string | undefined
): ParsedSortOptions {
  return {
    field: parseSortField(field),
    order: parseSortOrder(order),
  };
}
