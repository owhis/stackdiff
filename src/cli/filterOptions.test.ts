import {
  parseIncludePatterns,
  parseExcludePatterns,
  parseFilterOptions,
  toFilterOptions,
} from './filterOptions';

describe('parseIncludePatterns', () => {
  it('returns undefined for undefined input', () => {
    expect(parseIncludePatterns(undefined)).toBeUndefined();
  });

  it('splits comma-separated patterns', () => {
    expect(parseIncludePatterns('DB_*,API_*')).toEqual(['DB_*', 'API_*']);
  });

  it('trims whitespace from patterns', () => {
    expect(parseIncludePatterns(' DB_* , API_* ')).toEqual(['DB_*', 'API_*']);
  });

  it('filters empty entries', () => {
    expect(parseIncludePatterns('DB_*,,API_*')).toEqual(['DB_*', 'API_*']);
  });
});

describe('parseExcludePatterns', () => {
  it('returns undefined for undefined input', () => {
    expect(parseExcludePatterns(undefined)).toBeUndefined();
  });

  it('splits comma-separated patterns', () => {
    expect(parseExcludePatterns('SECRET_*,INTERNAL_*')).toEqual(['SECRET_*', 'INTERNAL_*']);
  });
});

describe('parseFilterOptions', () => {
  it('returns defaults when no args provided', () => {
    const result = parseFilterOptions({});
    expect(result).toEqual({
      include: undefined,
      exclude: undefined,
      changedOnly: false,
      prefix: undefined,
    });
  });

  it('parses all fields correctly', () => {
    const result = parseFilterOptions({
      include: 'DB_*',
      exclude: 'SECRET_*',
      changedOnly: true,
      prefix: 'APP_',
    });
    expect(result.include).toEqual(['DB_*']);
    expect(result.exclude).toEqual(['SECRET_*']);
    expect(result.changedOnly).toBe(true);
    expect(result.prefix).toBe('APP_');
  });

  it('trims empty prefix to undefined', () => {
    const result = parseFilterOptions({ prefix: '   ' });
    expect(result.prefix).toBeUndefined();
  });
});

describe('toFilterOptions', () => {
  it('maps parsed options to FilterOptions shape', () => {
    const parsed = {
      include: ['DB_*'],
      exclude: ['SECRET_*'],
      changedOnly: false,
      prefix: 'APP_',
    };
    const result = toFilterOptions(parsed);
    expect(result).toEqual({
      includePatterns: ['DB_*'],
      excludePatterns: ['SECRET_*'],
      prefix: 'APP_',
    });
  });
});
