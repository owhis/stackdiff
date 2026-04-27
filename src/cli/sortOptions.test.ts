import { parseSortField, parseSortOrder, parseSortOptions } from './sortOptions';

describe('parseSortField', () => {
  it('returns "key" for "key" input', () => {
    expect(parseSortField('key')).toBe('key');
  });

  it('returns "status" for "status" input', () => {
    expect(parseSortField('status')).toBe('status');
  });

  it('returns default "key" for undefined', () => {
    expect(parseSortField(undefined)).toBe('key');
  });

  it('throws for unknown sort field', () => {
    expect(() => parseSortField('unknown')).toThrow(/invalid sort field/i);
  });
});

describe('parseSortOrder', () => {
  it('returns "asc" for "asc" input', () => {
    expect(parseSortOrder('asc')).toBe('asc');
  });

  it('returns "desc" for "desc" input', () => {
    expect(parseSortOrder('desc')).toBe('desc');
  });

  it('returns default "asc" for undefined', () => {
    expect(parseSortOrder(undefined)).toBe('asc');
  });

  it('throws for unknown sort order', () => {
    expect(() => parseSortOrder('random')).toThrow(/invalid sort order/i);
  });
});

describe('parseSortOptions', () => {
  it('returns default options when no args provided', () => {
    const opts = parseSortOptions({});
    expect(opts).toEqual({ field: 'key', order: 'asc' });
  });

  it('parses field and order from args', () => {
    const opts = parseSortOptions({ sortBy: 'status', sortOrder: 'desc' });
    expect(opts).toEqual({ field: 'status', order: 'desc' });
  });

  it('throws if field is invalid', () => {
    expect(() => parseSortOptions({ sortBy: 'value' })).toThrow();
  });
});
