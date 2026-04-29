import { DiffEntry } from "../diff/envDiff";

export type GroupField = "prefix" | "status" | "none";

export interface GroupOptions {
  groupBy: GroupField;
  separator: string;
}

export function parseGroupField(args: Record<string, unknown>): GroupField {
  const val = args["group-by"];
  if (val === "prefix" || val === "status") return val;
  return "none";
}

export function parseGroupSeparator(args: Record<string, unknown>): string {
  const val = args["group-separator"];
  if (typeof val === "string" && val.length > 0) return val;
  return "_";
}

export function parseGroupOptions(args: Record<string, unknown>): GroupOptions {
  return {
    groupBy: parseGroupField(args),
    separator: parseGroupSeparator(args),
  };
}

export function extractPrefix(key: string, separator: string): string {
  const idx = key.indexOf(separator);
  return idx > 0 ? key.slice(0, idx) : "(ungrouped)";
}

export function groupEntries(
  entries: DiffEntry[],
  options: GroupOptions
): Map<string, DiffEntry[]> {
  const map = new Map<string, DiffEntry[]>();

  for (const entry of entries) {
    let groupKey: string;

    if (options.groupBy === "prefix") {
      groupKey = extractPrefix(entry.key, options.separator);
    } else if (options.groupBy === "status") {
      groupKey = entry.status;
    } else {
      groupKey = "all";
    }

    if (!map.has(groupKey)) {
      map.set(groupKey, []);
    }
    map.get(groupKey)!.push(entry);
  }

  return map;
}
