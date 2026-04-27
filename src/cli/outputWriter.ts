import * as fs from "fs";
import * as path from "path";
import { OutputOptions, OutputFormat } from "./outputOptions";
import { DiffEntry } from "../diff/envDiff";
import { formatDiff } from "../formatter/envFormatter";
import { formatTable } from "../formatter/tableFormatter";
import { buildJsonReport, serializeJsonReport } from "../reporter/jsonReporter";

export function renderOutput(
  entries: DiffEntry[],
  format: OutputFormat,
  noColor: boolean
): string {
  switch (format) {
    case "table":
      return formatTable(entries);
    case "json": {
      const report = buildJsonReport(entries);
      return serializeJsonReport(report);
    }
    case "text":
    default:
      return formatDiff(entries, { noColor });
  }
}

export function writeOutput(
  content: string,
  options: OutputOptions
): void {
  if (options.outputFile) {
    const dir = path.dirname(options.outputFile);
    if (dir && dir !== ".") {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.outputFile, content, "utf-8");
  } else {
    process.stdout.write(content + "\n");
  }
}

export function handleOutput(
  entries: DiffEntry[],
  options: OutputOptions
): void {
  const content = renderOutput(entries, options.format, options.noColor);
  writeOutput(content, options);
}
