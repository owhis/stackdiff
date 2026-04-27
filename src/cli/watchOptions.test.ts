import { parseWatchMode, parseWatchInterval, parseWatchOptions } from './watchOptions';

describe('parseWatchMode', () => {
  it('returns "native" by default', () => {
    expect(parseWatchMode(undefined)).toBe('native');
  });

  it('returns "poll" for "poll" input', () => {
    expect(parseWatchMode('poll')).toBe('poll');
  });

  it('returns "native" for "native" input', () => {
    expect(parseWatchMode('native')).toBe('native');
  });

  it('throws for unknown mode', () => {
    expect(() => parseWatchMode('inotify')).toThrow(/invalid watch mode/i);
  });
});

describe('parseWatchInterval', () => {
  it('returns default 1000ms when undefined', () => {
    expect(parseWatchInterval(undefined)).toBe(1000);
  });

  it('parses numeric string', () => {
    expect(parseWatchInterval('500')).toBe(500);
  });

  it('accepts number directly', () => {
    expect(parseWatchInterval(2000)).toBe(2000);
  });

  it('throws for zero interval', () => {
    expect(() => parseWatchInterval(0)).toThrow(/invalid watch interval/i);
  });

  it('throws for negative interval', () => {
    expect(() => parseWatchInterval(-100)).toThrow(/invalid watch interval/i);
  });

  it('throws for non-numeric string', () => {
    expect(() => parseWatchInterval('fast')).toThrow(/invalid watch interval/i);
  });
});

describe('parseWatchOptions', () => {
  it('returns defaults when no args provided', () => {
    const opts = parseWatchOptions({});
    expect(opts).toEqual({ enabled: false, intervalMs: 1000, mode: 'native', clearOnChange: true });
  });

  it('enables watch when watch flag is set', () => {
    const opts = parseWatchOptions({ watch: true });
    expect(opts.enabled).toBe(true);
  });

  it('parses all options together', () => {
    const opts = parseWatchOptions({ watch: true, watchMode: 'poll', watchInterval: '750', clearOnChange: false });
    expect(opts).toEqual({ enabled: true, intervalMs: 750, mode: 'poll', clearOnChange: false });
  });

  it('throws if watchMode is invalid', () => {
    expect(() => parseWatchOptions({ watchMode: 'bad' })).toThrow();
  });
});
