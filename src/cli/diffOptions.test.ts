import {
  parseShowMode,
  parseIgnoreCase,
  parseIgnoreWhitespace,
  parseDiffOptions,
  toDiffOptions,
} from './diffOptions';

describe('parseShowMode', () => {
  it('returns "all" by default for non-string input', () => {
    expect(parseShowMode(undefined)).toBe('all');
    expect(parseShowMode(null)).toBe('all');
  });

  it('parses valid show modes', () => {
    expect(parseShowMode('all')).toBe('all');
    expect(parseShowMode('changed')).toBe('changed');
    expect(parseShowMode('added')).toBe('added');
    expect(parseShowMode('removed')).toBe('removed');
    expect(parseShowMode('unchanged')).toBe('unchanged');
  });

  it('is case-insensitive', () => {
    expect(parseShowMode('CHANGED')).toBe('changed');
    expect(parseShowMode('Added')).toBe('added');
  });

  it('throws on invalid value', () => {
    expect(() => parseShowMode('invalid')).toThrow(/Invalid --show value/);
  });
});

describe('parseIgnoreCase', () => {
  it('returns false by default', () => {
    expect(parseIgnoreCase(undefined)).toBe(false);
    expect(parseIgnoreCase('unknown')).toBe(false);
  });

  it('parses boolean values', () => {
    expect(parseIgnoreCase(true)).toBe(true);
    expect(parseIgnoreCase(false)).toBe(false);
  });

  it('parses string representations', () => {
    expect(parseIgnoreCase('true')).toBe(true);
    expect(parseIgnoreCase('1')).toBe(true);
    expect(parseIgnoreCase('false')).toBe(false);
    expect(parseIgnoreCase('0')).toBe(false);
  });
});

describe('parseIgnoreWhitespace', () => {
  it('returns false by default', () => {
    expect(parseIgnoreWhitespace(undefined)).toBe(false);
  });

  it('parses truthy string values', () => {
    expect(parseIgnoreWhitespace('true')).toBe(true);
    expect(parseIgnoreWhitespace('1')).toBe(true);
  });
});

describe('parseDiffOptions', () => {
  it('returns defaults when argv is empty', () => {
    const result = parseDiffOptions({});
    expect(result).toEqual({ show: 'all', ignoreCase: false, ignoreWhitespace: false });
  });

  it('parses all fields from argv', () => {
    const result = parseDiffOptions({
      show: 'changed',
      'ignore-case': true,
      'ignore-whitespace': '1',
    });
    expect(result).toEqual({ show: 'changed', ignoreCase: true, ignoreWhitespace: true });
  });
});

describe('toDiffOptions', () => {
  it('maps parsed options to DiffOptions shape', () => {
    const parsed = { show: 'all' as const, ignoreCase: true, ignoreWhitespace: false };
    const result = toDiffOptions(parsed);
    expect(result).toEqual({ ignoreCase: true, ignoreWhitespace: false });
  });
});
