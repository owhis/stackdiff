import { DiffEntry } from "../diff/envDiff";

export interface AnnotateOptions {
  enabled: boolean;
  showSource: boolean;
  showLineNumber: boolean;
  label: string | undefined;
}

export function parseAnnotateEnabled(args: string[]): boolean {
  return args.includes("--annotate") || args.includes("-a");
}

export function parseShowSource(args: string[]): boolean {
  return args.includes("--annotate-source");
}

export function parseShowLineNumber(args: string[]): boolean {
  return args.includes("--annotate-line");
}

export function parseAnnotateLabel(args: string[]): string | undefined {
  const idx = args.indexOf("--annotate-label");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return undefined;
}

export function parseAnnotateOptions(args: string[]): AnnotateOptions {
  return {
    enabled: parseAnnotateEnabled(args),
    showSource: parseShowSource(args),
    showLineNumber: parseShowLineNumber(args),
    label: parseAnnotateLabel(args),
  };
}

export interface AnnotatedEntry extends DiffEntry {
  annotation?: string;
}

export function annotateEntries(
  entries: DiffEntry[],
  options: AnnotateOptions,
  sourceFile?: string
): AnnotatedEntry[] {
  if (!options.enabled) return entries;

  return entries.map((entry, idx) => {
    const parts: string[] = [];

    if (options.label) {
      parts.push(options.label);
    }
    if (options.showSource && sourceFile) {
      parts.push(`src:${sourceFile}`);
    }
    if (options.showLineNumber) {
      parts.push(`line:${idx + 1}`);
    }

    return {
      ...entry,
      annotation: parts.length > 0 ? parts.join(" | ") : undefined,
    };
  });
}
