import fs from "fs";
import os from "os";
import path from "path";
import { validateAgainstSchema, formatSchemaReport } from "./schemaValidator";

function writeTempSchema(keys: string[]): string {
  const file = path.join(os.tmpdir(), `schema-val-${Date.now()}.env`);
  fs.writeFileSync(file, keys.join("\n"), "utf-8");
  return file;
}

describe("validateAgainstSchema", () => {
  it("returns valid when all schema keys are present", () => {
    const schema = writeTempSchema(["API_KEY", "DB_HOST"]);
    const result = validateAgainstSchema(["API_KEY", "DB_HOST", "EXTRA"], schema);
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual(["EXTRA"]);
  });

  it("reports missing keys", () => {
    const schema = writeTempSchema(["API_KEY", "DB_HOST", "PORT"]);
    const result = validateAgainstSchema(["API_KEY"], schema);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("DB_HOST");
    expect(result.missing).toContain("PORT");
  });

  it("returns valid and no extra when exact match", () => {
    const schema = writeTempSchema(["A", "B"]);
    const result = validateAgainstSchema(["A", "B"], schema);
    expect(result.valid).toBe(true);
    expect(result.extra).toEqual([]);
  });
});

describe("formatSchemaReport", () => {
  it("shows success message when valid and no extra", () => {
    const report = formatSchemaReport({ missing: [], extra: [], valid: true }, false);
    expect(report).toContain("passed");
  });

  it("lists missing keys", () => {
    const report = formatSchemaReport({ missing: ["API_KEY"], extra: [], valid: false }, false);
    expect(report).toContain("API_KEY");
    expect(report).toContain("Missing");
  });

  it("lists extra keys in strict mode", () => {
    const report = formatSchemaReport({ missing: [], extra: ["UNKNOWN"], valid: true }, true);
    expect(report).toContain("UNKNOWN");
    expect(report).toContain("Extra");
  });

  it("does not list extra keys when not strict", () => {
    const report = formatSchemaReport({ missing: [], extra: ["UNKNOWN"], valid: true }, false);
    expect(report).toContain("passed");
    expect(report).not.toContain("UNKNOWN");
  });
});
