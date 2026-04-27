/**
 * Options for masking sensitive environment variable values in output.
 */

export interface MaskOptions {
  enabled: boolean;
  patterns: RegExp[];
  maskChar: string;
  revealCount: number;
}

const DEFAULT_SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

export function parseMaskEnabled(args: Record<string, unknown>): boolean {
  if (typeof args['mask'] === 'boolean') return args['mask'];
  if (typeof args['no-mask'] === 'boolean') return !args['no-mask'];
  return true;
}

export function parseMaskChar(args: Record<string, unknown>): string {
  const val = args['mask-char'];
  if (typeof val === 'string' && val.length > 0) return val[0];
  return '*';
}

export function parseRevealCount(args: Record<string, unknown>): number {
  const val = args['reveal-count'];
  if (typeof val === 'number' && val >= 0) return Math.floor(val);
  if (typeof val === 'string') {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) return n;
  }
  return 0;
}

export function parseMaskPatterns(args: Record<string, unknown>): RegExp[] {
  const val = args['mask-patterns'];
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => new RegExp(p, 'i'));
  }
  if (Array.isArray(val)) {
    return val
      .filter((p): p is string => typeof p === 'string')
      .map((p) => new RegExp(p, 'i'));
  }
  return DEFAULT_SENSITIVE_PATTERNS;
}

export function parseMaskOptions(args: Record<string, unknown>): MaskOptions {
  return {
    enabled: parseMaskEnabled(args),
    patterns: parseMaskPatterns(args),
    maskChar: parseMaskChar(args),
    revealCount: parseRevealCount(args),
  };
}

export function maskValue(
  key: string,
  value: string,
  options: MaskOptions
): string {
  if (!options.enabled) return value;
  const isSensitive = options.patterns.some((p) => p.test(key));
  if (!isSensitive) return value;
  if (value.length === 0) return value;
  const reveal = Math.min(options.revealCount, Math.floor(value.length / 2));
  const masked = options.maskChar.repeat(Math.max(value.length - reveal, 4));
  return reveal > 0 ? masked + value.slice(-reveal) : masked;
}
