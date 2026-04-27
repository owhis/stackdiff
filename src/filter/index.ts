export { matchesPattern, filterEntries, filterChanged } from './envFilter';
export type { FilterOptions } from './envFilter';

/**
 * Re-export a convenience function for quickly checking if a key should be
 * included based on a list of patterns, without needing to import directly
 * from the sub-module.
 */
export { matchesPattern as shouldIncludeKey } from './envFilter';
