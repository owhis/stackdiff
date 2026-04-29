import { DiffEntry } from "../diff/envDiff";

export interface RedactOptions {
  enabled: boolean;
  keys: string[];
  replacement: string;
}

export function parseRedactEnabled(args: string[]): boolean {
  return args.includes("--redact");
}

export function parseRedactKeys(args: string[]): string[] {
  const idx = args.indexOf("--redact-keys");
  if (idx === -1 || idx + 1 >= args.length) return [];
  return args[idx + 1].split(",").map((k) => k.trim()).filter(Boolean);
}

export function parseRedactReplacement(args: string[]): string {
  const idx = args.indexOf("--redact-replacement");
  if (idx === -1 || idx + 1 >= args.length) return "[REDACTED]";
  return args[idx + 1];
}

export function parseRedactOptions(args: string[]): RedactOptions {
  return {
    enabled: parseRedactEnabled(args),
    keys: parseRedactKeys(args),
    replacement: parseRedactReplacement(args),
  };
}

export function applyRedact(
  entries: DiffEntry[],
  options: RedactOptions
): DiffEntry[] {
  if (!options.enabled || options.keys.length === 0) return entries;
  const keySet = new Set(options.keys.map((k) => k.toLowerCase()));
  return entries.map((entry) => {
    if (!keySet.has(entry.key.toLowerCase())) return entry;
    return {
      ...entry,
      valueA: entry.valueA !== undefined ? options.replacement : undefined,
      valueB: entry.valueB !== undefined ? options.replacement : undefined,
    };
  });
}
