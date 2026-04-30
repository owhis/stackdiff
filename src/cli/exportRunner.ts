import fs from "fs";
import { DiffEntry } from "../diff/envDiff";
import { ExportOptions, ExportFormat } from "./exportOptions";

function applyPrefix(key: string, prefix: string): string {
  return prefix ? `${prefix}${key}` : key;
}

function selectEntries(entries: DiffEntry[], includeUnchanged: boolean): DiffEntry[] {
  if (includeUnchanged) return entries;
  return entries.filter((e) => e.status !== "unchanged");
}

export function renderDotenv(entries: DiffEntry[], prefix: string): string {
  return entries
    .map((e) => `${applyPrefix(e.key, prefix)}=${e.nextValue ?? e.value ?? ""}`)
    .join("\n");
}

export function renderJson(entries: DiffEntry[], prefix: string): string {
  const obj: Record<string, string> = {};
  for (const e of entries) {
    obj[applyPrefix(e.key, prefix)] = e.nextValue ?? e.value ?? "";
  }
  return JSON.stringify(obj, null, 2);
}

export function renderYaml(entries: DiffEntry[], prefix: string): string {
  const lines = entries.map((e) => {
    const val = e.nextValue ?? e.value ?? "";
    const safe = val.includes(":") || val.includes("#") ? `"${val}"` : val;
    return `${applyPrefix(e.key, prefix)}: ${safe}`;
  });
  return lines.join("\n");
}

export function renderShell(entries: DiffEntry[], prefix: string): string {
  return entries
    .map((e) => `export ${applyPrefix(e.key, prefix)}="${e.nextValue ?? e.value ?? ""}"`)
    .join("\n");
}

export function renderExport(
  entries: DiffEntry[],
  format: ExportFormat,
  prefix: string
): string {
  switch (format) {
    case "json": return renderJson(entries, prefix);
    case "yaml": return renderYaml(entries, prefix);
    case "shell": return renderShell(entries, prefix);
    default: return renderDotenv(entries, prefix);
  }
}

export function runExport(entries: DiffEntry[], opts: ExportOptions): string {
  const selected = selectEntries(entries, opts.includeUnchanged);
  const output = renderExport(selected, opts.format, opts.prefix);
  if (opts.outputFile) {
    fs.writeFileSync(opts.outputFile, output, "utf-8");
  }
  return output;
}
