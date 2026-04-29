import {
  parseGroupField,
  parseGroupSeparator,
  parseGroupOptions,
  extractPrefix,
  groupEntries,
} from "./groupOptions";
import { DiffEntry } from "../diff/envDiff";

function makeEntry(key: string, status: DiffEntry["status"]): DiffEntry {
  return { key, status, left: "a", right: "b" };
}

describe("parseGroupField", () => {
  it("returns prefix when specified", () => {
    expect(parseGroupField({ "group-by": "prefix" })).toBe("prefix");
  });

  it("returns status when specified", () => {
    expect(parseGroupField({ "group-by": "status" })).toBe("status");
  });

  it("defaults to none for unknown values", () => {
    expect(parseGroupField({ "group-by": "unknown" })).toBe("none");
    expect(parseGroupField({})).toBe("none");
  });
});

describe("parseGroupSeparator", () => {
  it("returns custom separator", () => {
    expect(parseGroupSeparator({ "group-separator": "__" })).toBe("__");
  });

  it("defaults to underscore", () => {
    expect(parseGroupSeparator({})).toBe("_");
    expect(parseGroupSeparator({ "group-separator": "" })).toBe("_");
  });
});

describe("extractPrefix", () => {
  it("extracts prefix before separator", () => {
    expect(extractPrefix("APP_HOST", "_")).toBe("APP");
    expect(extractPrefix("DB__PORT", "__")).toBe("DB");
  });

  it("returns ungrouped when separator not found", () => {
    expect(extractPrefix("HOSTNAME", "_")).toBe("(ungrouped)");
  });
});

describe("groupEntries", () => {
  const entries = [
    makeEntry("APP_HOST", "changed"),
    makeEntry("APP_PORT", "added"),
    makeEntry("DB_HOST", "removed"),
    makeEntry("SIMPLE", "unchanged"),
  ];

  it("groups by prefix", () => {
    const opts = parseGroupOptions({ "group-by": "prefix" });
    const result = groupEntries(entries, opts);
    expect(result.get("APP")).toHaveLength(2);
    expect(result.get("DB")).toHaveLength(1);
    expect(result.get("(ungrouped)")).toHaveLength(1);
  });

  it("groups by status", () => {
    const opts = parseGroupOptions({ "group-by": "status" });
    const result = groupEntries(entries, opts);
    expect(result.get("changed")).toHaveLength(1);
    expect(result.get("added")).toHaveLength(1);
    expect(result.get("removed")).toHaveLength(1);
  });

  it("puts all entries under 'all' when groupBy is none", () => {
    const opts = parseGroupOptions({});
    const result = groupEntries(entries, opts);
    expect(result.get("all")).toHaveLength(4);
    expect(result.size).toBe(1);
  });
});
