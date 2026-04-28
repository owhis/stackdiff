import * as fs from "fs";
import * as path from "path";
import { EnvMap } from "../parser/envParser";
import { DiffEntry } from "../diff/envDiff";
import { resolveBaselinePath, ensureBaselineDir, BaselineOptions } from "./baselineOptions";

export interface BaselineSnapshot {
  createdAt: string;
  files: string[];
  entries: Record<string, string>;
}

export function buildSnapshot(
  files: string[],
  envMap: EnvMap
): BaselineSnapshot {
  return {
    createdAt: new Date().toISOString(),
    files,
    entries: Object.fromEntries(envMap),
  };
}

export function saveBaseline(
  opts: BaselineOptions,
  name: string,
  snapshot: BaselineSnapshot
): string {
  ensureBaselineDir(path.resolve(opts.baselineDir));
  const filePath = resolveBaselinePath(opts, name);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
  return filePath;
}

export function loadBaseline(
  opts: BaselineOptions,
  name: string
): BaselineSnapshot | null {
  const filePath = resolveBaselinePath(opts, name);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as BaselineSnapshot;
}

export function diffAgainstBaseline(
  snapshot: BaselineSnapshot,
  current: EnvMap
): DiffEntry[] {
  const results: DiffEntry[] = [];
  const baseMap = new Map(Object.entries(snapshot.entries));

  for (const [key, currentVal] of current) {
    if (!baseMap.has(key)) {
      results.push({ key, status: "added", left: undefined, right: currentVal });
    } else if (baseMap.get(key) !== currentVal) {
      results.push({ key, status: "changed", left: baseMap.get(key), right: currentVal });
    }
  }

  for (const [key, baseVal] of baseMap) {
    if (!current.has(key)) {
      results.push({ key, status: "removed", left: baseVal, right: undefined });
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}
