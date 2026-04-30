import path from "path";

export type ExportFormat = "dotenv" | "json" | "yaml" | "shell";

export interface ExportOptions {
  format: ExportFormat;
  outputFile: string | null;
  includeUnchanged: boolean;
  prefix: string;
}

export function parseExportFormat(args: Record<string, unknown>): ExportFormat {
  const val = args["export-format"] ?? args["ef"];
  const valid: ExportFormat[] = ["dotenv", "json", "yaml", "shell"];
  if (typeof val === "string" && valid.includes(val as ExportFormat)) {
    return val as ExportFormat;
  }
  return "dotenv";
}

export function parseExportOutputFile(args: Record<string, unknown>): string | null {
  const val = args["export-output"] ?? args["eo"];
  if (typeof val === "string" && val.trim().length > 0) {
    return path.resolve(val.trim());
  }
  return null;
}

export function parseExportIncludeUnchanged(args: Record<string, unknown>): boolean {
  return args["export-all"] === true || args["ea"] === true;
}

export function parseExportPrefix(args: Record<string, unknown>): string {
  const val = args["export-prefix"] ?? args["ep"];
  return typeof val === "string" ? val : "";
}

export function parseExportOptions(args: Record<string, unknown>): ExportOptions {
  return {
    format: parseExportFormat(args),
    outputFile: parseExportOutputFile(args),
    includeUnchanged: parseExportIncludeUnchanged(args),
    prefix: parseExportPrefix(args),
  };
}
