import * as path from "path";
import * as fs from "fs";

export interface BaselineOptions {
  baselineFile: string | null;
  saveBaseline: boolean;
  baselineDir: string;
}

export function parseBaselineFile(args: string[]): string | null {
  const idx = args.indexOf("--baseline");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return null;
}

export function parseSaveBaseline(args: string[]): boolean {
  return args.includes("--save-baseline");
}

export function parseBaselineDir(args: string[]): string {
  const idx = args.indexOf("--baseline-dir");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return ".stackdiff";
}

export function parseBaselineOptions(args: string[]): BaselineOptions {
  return {
    baselineFile: parseBaselineFile(args),
    saveBaseline: parseSaveBaseline(args),
    baselineDir: parseBaselineDir(args),
  };
}

export function resolveBaselinePath(
  opts: BaselineOptions,
  name: string
): string {
  if (opts.baselineFile) {
    return path.resolve(opts.baselineFile);
  }
  return path.resolve(opts.baselineDir, `${name}.baseline.json`);
}

export function ensureBaselineDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
