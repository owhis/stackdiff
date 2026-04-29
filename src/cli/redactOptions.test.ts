import {
  parseRedactEnabled,
  parseRedactKeys,
  parseRedactReplacement,
  parseRedactOptions,
  applyRedact,
} from "./redactOptions";
import { DiffEntry } from "../diff/envDiff";

function makeEntry(key: string, valueA?: string, valueB?: string): DiffEntry {
  const status =
    valueA === undefined ? "added" : valueB === undefined ? "removed" : "changed";
  return { key, valueA, valueB, status } as DiffEntry;
}

describe("parseRedactEnabled", () => {
  it("returns true when --redact is present", () => {
    expect(parseRedactEnabled(["--redact"])).toBe(true);
  });
  it("returns false when absent", () => {
    expect(parseRedactEnabled([])).toBe(false);
  });
});

describe("parseRedactKeys", () => {
  it("parses comma-separated keys", () => {
    expect(parseRedactKeys(["--redact-keys", "SECRET,TOKEN,PASSWORD"])).toEqual([
      "SECRET",
      "TOKEN",
      "PASSWORD",
    ]);
  });
  it("returns empty array when flag is missing", () => {
    expect(parseRedactKeys([])).toEqual([]);
  });
});

describe("parseRedactReplacement", () => {
  it("returns custom replacement", () => {
    expect(parseRedactReplacement(["--redact-replacement", "***"])).toBe("***");
  });
  it("returns default when not specified", () => {
    expect(parseRedactReplacement([])).toBe("[REDACTED]");
  });
});

describe("parseRedactOptions", () => {
  it("combines all options", () => {
    const opts = parseRedactOptions(["--redact", "--redact-keys", "API_KEY"]);
    expect(opts).toEqual({ enabled: true, keys: ["API_KEY"], replacement: "[REDACTED]" });
  });
});

describe("applyRedact", () => {
  const entries = [
    makeEntry("API_KEY", "abc", "xyz"),
    makeEntry("HOST", "localhost", "prod.example.com"),
  ];

  it("redacts matching keys", () => {
    const result = applyRedact(entries, { enabled: true, keys: ["API_KEY"], replacement: "[REDACTED]" });
    expect(result[0].valueA).toBe("[REDACTED]");
    expect(result[0].valueB).toBe("[REDACTED]");
    expect(result[1].valueA).toBe("localhost");
  });

  it("is case-insensitive for key matching", () => {
    const result = applyRedact(entries, { enabled: true, keys: ["api_key"], replacement: "***" });
    expect(result[0].valueA).toBe("***");
  });

  it("returns entries unchanged when disabled", () => {
    const result = applyRedact(entries, { enabled: false, keys: ["API_KEY"], replacement: "[REDACTED]" });
    expect(result).toEqual(entries);
  });

  it("returns entries unchanged when no keys specified", () => {
    const result = applyRedact(entries, { enabled: true, keys: [], replacement: "[REDACTED]" });
    expect(result).toEqual(entries);
  });
});
