import {
  parseMaskEnabled,
  parseMaskChar,
  parseRevealCount,
  parseMaskPatterns,
  parseMaskOptions,
  maskValue,
} from './maskOptions';

describe('parseMaskEnabled', () => {
  it('defaults to true when no flags given', () => {
    expect(parseMaskEnabled({})).toBe(true);
  });

  it('respects --mask flag', () => {
    expect(parseMaskEnabled({ mask: false })).toBe(false);
  });

  it('respects --no-mask flag', () => {
    expect(parseMaskEnabled({ 'no-mask': true })).toBe(false);
  });
});

describe('parseMaskChar', () => {
  it('defaults to asterisk', () => {
    expect(parseMaskChar({})).toBe('*');
  });

  it('uses provided char', () => {
    expect(parseMaskChar({ 'mask-char': '#' })).toBe('#');
  });

  it('uses only first character of multi-char string', () => {
    expect(parseMaskChar({ 'mask-char': 'XYZ' })).toBe('X');
  });
});

describe('parseRevealCount', () => {
  it('defaults to 0', () => {
    expect(parseRevealCount({})).toBe(0);
  });

  it('parses numeric value', () => {
    expect(parseRevealCount({ 'reveal-count': 4 })).toBe(4);
  });

  it('parses string value', () => {
    expect(parseRevealCount({ 'reveal-count': '3' })).toBe(3);
  });

  it('rejects negative values', () => {
    expect(parseRevealCount({ 'reveal-count': -1 })).toBe(0);
  });
});

describe('parseMaskPatterns', () => {
  it('returns defaults when no arg given', () => {
    const patterns = parseMaskPatterns({});
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('parses comma-separated string patterns', () => {
    const patterns = parseMaskPatterns({ 'mask-patterns': 'foo,bar' });
    expect(patterns).toHaveLength(2);
    expect(patterns[0].test('FOO_KEY')).toBe(true);
  });
});

describe('maskValue', () => {
  const opts = parseMaskOptions({});

  it('masks sensitive keys', () => {
    const result = maskValue('API_SECRET', 'supersecret123', opts);
    expect(result).not.toBe('supersecret123');
    expect(result).toMatch(/^\*+$/);
  });

  it('does not mask non-sensitive keys', () => {
    const result = maskValue('APP_NAME', 'myapp', opts);
    expect(result).toBe('myapp');
  });

  it('reveals trailing characters when revealCount > 0', () => {
    const custom = parseMaskOptions({ 'reveal-count': 3 });
    const result = maskValue('DB_PASSWORD', 'abc123xyz', custom);
    expect(result.endsWith('xyz')).toBe(true);
  });

  it('does not mask when disabled', () => {
    const disabled = parseMaskOptions({ mask: false });
    expect(maskValue('API_TOKEN', 'secret', disabled)).toBe('secret');
  });
});
