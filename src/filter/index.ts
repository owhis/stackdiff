export { matchesPattern, filterEntries, filterChanged } from './envFilter';

export interface FilterOptions {
  includePatterns?: string[];
  excludePatterns?: string[];
  prefix?: string;
}
