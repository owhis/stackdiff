import { loadSchemaKeys, SchemaValidationResult } from "./schemaOptions";

export function validateAgainstSchema(
  envKeys: string[],
  schemaFile: string
): SchemaValidationResult {
  const schemaKeys = loadSchemaKeys(schemaFile);
  const schemaSet = new Set(schemaKeys);
  const envSet = new Set(envKeys);

  const missing = schemaKeys.filter((k) => !envSet.has(k));
  const extra = envKeys.filter((k) => !schemaSet.has(k));

  return {
    missing,
    extra,
    valid: missing.length === 0,
  };
}

export function formatSchemaReport(
  result: SchemaValidationResult,
  strict: boolean
): string {
  const lines: string[] = [];

  if (result.valid && result.extra.length === 0) {
    lines.push("✔ Schema validation passed.");
    return lines.join("\n");
  }

  if (result.missing.length > 0) {
    lines.push(`✖ Missing required keys (${result.missing.length}):`);
    result.missing.forEach((k) => lines.push(`  - ${k}`));
  }

  if (strict && result.extra.length > 0) {
    lines.push(`⚠ Extra keys not in schema (${result.extra.length}):`);
    result.extra.forEach((k) => lines.push(`  + ${k}`));
  }

  return lines.join("\n");
}

export function applySchemaValidation(
  envKeys: string[],
  schemaFile: string,
  strict: boolean,
  warnOnly: boolean
): void {
  const result = validateAgainstSchema(envKeys, schemaFile);
  const report = formatSchemaReport(result, strict);

  if (!result.valid || (strict && result.extra.length > 0)) {
    if (warnOnly) {
      console.warn(report);
    } else if (!result.valid) {
      console.error(report);
      process.exit(1);
    } else {
      console.warn(report);
    }
  } else {
    console.log(report);
  }
}
