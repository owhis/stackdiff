import type { FilterOptions } from '../filter/index';

export interface ParsedFilterOptions {
  include?: string[];
  exclude?: string[];
  changedOnly: boolean;
  prefix?: string;
}

export function parseIncludePatterns(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function parseExcludePatterns(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function parseFilterOptions(args: {
  include?: string;
  exclude?: string;
  changedOnly?: boolean;
  prefix?: string;
}): ParsedFilterOptions {
  return {
    include: parseIncludePatterns(args.include),
    exclude: parseExcludePatterns(args.exclude),
    changedOnly: args.changedOnly === true,
    prefix: args.prefix?.trim() || undefined,
  };
}

export function toFilterOptions(parsed: ParsedFilterOptions): FilterOptions {
  return {
    includePatterns: parsed.include,
    excludePatterns: parsed.exclude,
    prefix: parsed.prefix,
  };
}
