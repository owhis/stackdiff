import path from "path";
import fs from "fs";

export interface SchemaOptions {
  schemaFile: string | null;
  strictMode: boolean;
  warnOnly: boolean;
}

export interface SchemaValidationResult {
  missing: string[];
  extra: string[];
  valid: boolean;
}

export function parseSchemaFile(args: Record<string, unknown>): string | null {
  const val = args["schema"];
  if (typeof val === "string" && val.trim().length > 0) {
    return path.resolve(val.trim());
  }
  return null;
}

export function parseStrictMode(args: Record<string, unknown>): boolean {
  return args["schema-strict"] === true || args["schema-strict"] === "true";
}

export function parseWarnOnly(args: Record<string, unknown>): boolean {
  return args["schema-warn"] === true || args["schema-warn"] === "true";
}

export function parseSchemaOptions(args: Record<string, unknown>): SchemaOptions {
  return {
    schemaFile: parseSchemaFile(args),
    strictMode: parseStrictMode(args),
    warnOnly: parseWarnOnly(args),
  };
}

export function loadSchemaKeys(schemaFile: string): string[] {
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found: ${schemaFile}`);
  }
  const raw = fs.readFileSync(schemaFile, "utf-8");
  const ext = path.extname(schemaFile).toLowerCase();
  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "object" && parsed !== null) return Object.keys(parsed);
    throw new Error("Schema JSON must be an array of keys or an object");
  }
  // treat as .env-style: one KEY per line, ignore comments and blank lines
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"))
    .map((l) => l.split("=")[0].trim());
}
