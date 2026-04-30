import fs from "fs";
import os from "os";
import path from "path";
import {
  parseSchemaFile,
  parseStrictMode,
  parseWarnOnly,
  parseSchemaOptions,
  loadSchemaKeys,
} from "./schemaOptions";

function writeTempSchema(content: string, ext = ".env"): string {
  const file = path.join(os.tmpdir(), `schema-test-${Date.now()}${ext}`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

describe("parseSchemaFile", () => {
  it("returns resolved path when provided", () => {
    const result = parseSchemaFile({ schema: "./schema.env" });
    expect(result).toBeTruthy();
    expect(result).toContain("schema.env");
  });

  it("returns null when not provided", () => {
    expect(parseSchemaFile({})).toBeNull();
    expect(parseSchemaFile({ schema: "" })).toBeNull();
  });
});

describe("parseStrictMode", () => {
  it("returns true when flag is set", () => {
    expect(parseStrictMode({ "schema-strict": true })).toBe(true);
    expect(parseStrictMode({ "schema-strict": "true" })).toBe(true);
  });

  it("returns false by default", () => {
    expect(parseStrictMode({})).toBe(false);
  });
});

describe("parseWarnOnly", () => {
  it("returns true when flag is set", () => {
    expect(parseWarnOnly({ "schema-warn": true })).toBe(true);
  });

  it("returns false by default", () => {
    expect(parseWarnOnly({})).toBe(false);
  });
});

describe("parseSchemaOptions", () => {
  it("parses all options together", () => {
    const opts = parseSchemaOptions({ schema: "schema.env", "schema-strict": true, "schema-warn": false });
    expect(opts.schemaFile).toContain("schema.env");
    expect(opts.strictMode).toBe(true);
    expect(opts.warnOnly).toBe(false);
  });
});

describe("loadSchemaKeys", () => {
  it("loads keys from .env-style file", () => {
    const file = writeTempSchema("API_KEY\nDB_HOST=\n# comment\nPORT");
    expect(loadSchemaKeys(file)).toEqual(["API_KEY", "DB_HOST", "PORT"]);
  });

  it("loads keys from JSON array", () => {
    const file = writeTempSchema(JSON.stringify(["KEY_A", "KEY_B"]), ".json");
    expect(loadSchemaKeys(file)).toEqual(["KEY_A", "KEY_B"]);
  });

  it("loads keys from JSON object", () => {
    const file = writeTempSchema(JSON.stringify({ KEY_A: "string", KEY_B: "number" }), ".json");
    expect(loadSchemaKeys(file)).toEqual(["KEY_A", "KEY_B"]);
  });

  it("throws when file does not exist", () => {
    expect(() => loadSchemaKeys("/nonexistent/schema.env")).toThrow("Schema file not found");
  });
});
