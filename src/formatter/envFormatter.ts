import chalk from "chalk";

export type DiffStatus = "added" | "removed" | "changed" | "unchanged";

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  leftValue?: string;
  rightValue?: string;
}

export interface FormatOptions {
  showUnchanged?: boolean;
  colorize?: boolean;
  compact?: boolean;
}

const STATUS_SYMBOLS: Record<DiffStatus, string> = {
  added: "+",
  removed: "-",
  changed: "~",
  unchanged: " ",
};

function colorize(text: string, status: DiffStatus): string {
  switch (status) {
    case "added":
      return chalk.green(text);
    case "removed":
      return chalk.red(text);
    case "changed":
      return chalk.yellow(text);
    case "unchanged":
      return chalk.gray(text);
  }
}

function formatEntry(entry: DiffEntry, opts: FormatOptions): string {
  const symbol = STATUS_SYMBOLS[entry.status];

  let line: string;
  if (entry.status === "changed") {
    line = `${symbol} ${entry.key}: ${entry.leftValue ?? ""} → ${entry.rightValue ?? ""}`;
  } else if (entry.status === "added") {
    line = `${symbol} ${entry.key}=${entry.rightValue ?? ""}`;
  } else if (entry.status === "removed") {
    line = `${symbol} ${entry.key}=${entry.leftValue ?? ""}`;
  } else {
    line = `${symbol} ${entry.key}=${entry.leftValue ?? ""}`;
  }

  return opts.colorize !== false ? colorize(line, entry.status) : line;
}

export function formatDiff(entries: DiffEntry[], opts: FormatOptions = {}): string {
  const filtered = opts.showUnchanged
    ? entries
    : entries.filter((e) => e.status !== "unchanged");

  if (filtered.length === 0) {
    return opts.colorize !== false
      ? chalk.gray("No differences found.")
      : "No differences found.";
  }

  const lines = filtered.map((entry) => formatEntry(entry, opts));

  if (opts.compact) {
    return lines.join("\n");
  }

  const summary = `${filtered.length} difference(s) found.`;
  return [...lines, "", opts.colorize !== false ? chalk.bold(summary) : summary].join("\n");
}
