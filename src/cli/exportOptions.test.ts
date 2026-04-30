import { parseExportOptions, parseExportFormat, parseExportOutputFile } from "./exportOptions";
import { renderDotenv, renderJson, renderYaml, renderShell, runExport } from "./exportRunner";
import { DiffEntry } from "../diff/envDiff";
import fs from "fs";
import os from "os";
import path from "path";

function makeEntry(key: string, value: string, status: DiffEntry["status"] = "unchanged"): DiffEntry {
  return { key, value, nextValue: value, status };
}

describe("parseExportFormat", () => {
  it("defaults to dotenv", () => {
    expect(parseExportFormat({})).toBe("dotenv");
  });

  it("parses valid formats", () => {
    expect(parseExportFormat({ "export-format": "json" })).toBe("json");
    expect(parseExportFormat({ "export-format": "yaml" })).toBe("yaml");
    expect(parseExportFormat({ "export-format": "shell" })).toBe("shell");
  });

  it("ignores invalid formats", () => {
    expect(parseExportFormat({ "export-format": "xml" })).toBe("dotenv");
  });
});

describe("parseExportOutputFile", () => {
  it("returns null when not set", () => {
    expect(parseExportOutputFile({})).toBeNull();
  });

  it("resolves path when set", () => {
    const result = parseExportOutputFile({ "export-output": "out.env" });
    expect(result).not.toBeNull();
    expect(result).toContain("out.env");
  });
});

describe("parseExportOptions", () => {
  it("parses all options together", () => {
    const opts = parseExportOptions({ "export-format": "shell", "export-all": true, "export-prefix": "APP_" });
    expect(opts.format).toBe("shell");
    expect(opts.includeUnchanged).toBe(true);
    expect(opts.prefix).toBe("APP_");
  });
});

describe("renderExport formats", () => {
  const entries = [makeEntry("FOO", "bar", "added"), makeEntry("BAZ", "qux", "changed")];

  it("renders dotenv", () => {
    expect(renderDotenv(entries, "")).toBe("FOO=bar\nBAZ=qux");
  });

  it("renders json", () => {
    const result = JSON.parse(renderJson(entries, ""));
    expect(result.FOO).toBe("bar");
  });

  it("renders yaml", () => {
    expect(renderYaml(entries, "")).toContain("FOO: bar");
  });

  it("renders shell", () => {
    expect(renderShell(entries, "")).toContain('export FOO="bar"');
  });

  it("applies prefix", () => {
    expect(renderDotenv(entries, "MY_")).toContain("MY_FOO=bar");
  });
});

describe("runExport", () => {
  it("filters unchanged entries by default", () => {
    const entries = [makeEntry("A", "1", "unchanged"), makeEntry("B", "2", "added")];
    const out = runExport(entries, { format: "dotenv", outputFile: null, includeUnchanged: false, prefix: "" });
    expect(out).not.toContain("A=");
    expect(out).toContain("B=2");
  });

  it("writes to file when outputFile is set", () => {
    const tmp = path.join(os.tmpdir(), `stackdiff-export-${Date.now()}.env`);
    const entries = [makeEntry("X", "1", "added")];
    runExport(entries, { format: "dotenv", outputFile: tmp, includeUnchanged: true, prefix: "" });
    const content = fs.readFileSync(tmp, "utf-8");
    expect(content).toContain("X=1");
    fs.unlinkSync(tmp);
  });
});
