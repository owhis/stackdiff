import {
  parseAnnotateEnabled,
  parseShowSource,
  parseShowLineNumber,
  parseAnnotateLabel,
  parseAnnotateOptions,
  annotateEntries,
  AnnotateOptions,
} from "./annotateOptions";
import { DiffEntry } from "../diff/envDiff";

function makeEntry(key: string, status: DiffEntry["status"] = "changed"): DiffEntry {
  return { key, leftValue: "a", rightValue: "b", status };
}

describe("parseAnnotateEnabled", () => {
  it("returns true for --annotate", () => {
    expect(parseAnnotateEnabled(["--annotate"])).toBe(true);
  });

  it("returns true for -a shorthand", () => {
    expect(parseAnnotateEnabled(["-a"])).toBe(true);
  });

  it("returns false when not present", () => {
    expect(parseAnnotateEnabled(["--format", "table"])).toBe(false);
  });
});

describe("parseShowSource", () => {
  it("returns true when --annotate-source is present", () => {
    expect(parseShowSource(["--annotate-source"])).toBe(true);
  });

  it("returns false otherwise", () => {
    expect(parseShowSource([])).toBe(false);
  });
});

describe("parseShowLineNumber", () => {
  it("returns true when --annotate-line is present", () => {
    expect(parseShowLineNumber(["--annotate-line"])).toBe(true);
  });
});

describe("parseAnnotateLabel", () => {
  it("returns label value", () => {
    expect(parseAnnotateLabel(["--annotate-label", "prod"])).toBe("prod");
  });

  it("returns undefined when missing", () => {
    expect(parseAnnotateLabel([])).toBeUndefined();
  });
});

describe("parseAnnotateOptions", () => {
  it("parses all options together", () => {
    const opts = parseAnnotateOptions(["-a", "--annotate-source", "--annotate-label", "staging"]);
    expect(opts.enabled).toBe(true);
    expect(opts.showSource).toBe(true);
    expect(opts.label).toBe("staging");
  });
});

describe("annotateEntries", () => {
  const baseOptions: AnnotateOptions = {
    enabled: true,
    showSource: false,
    showLineNumber: false,
    label: undefined,
  };

  it("returns entries unchanged when disabled", () => {
    const entries = [makeEntry("FOO")];
    const result = annotateEntries(entries, { ...baseOptions, enabled: false });
    expect(result[0].annotation).toBeUndefined();
  });

  it("adds label annotation", () => {
    const entries = [makeEntry("FOO")];
    const result = annotateEntries(entries, { ...baseOptions, label: "prod" });
    expect(result[0].annotation).toBe("prod");
  });

  it("adds source annotation", () => {
    const entries = [makeEntry("FOO")];
    const result = annotateEntries(entries, { ...baseOptions, showSource: true }, ".env.prod");
    expect(result[0].annotation).toBe("src:.env.prod");
  });

  it("adds line number annotation", () => {
    const entries = [makeEntry("FOO"), makeEntry("BAR")];
    const result = annotateEntries(entries, { ...baseOptions, showLineNumber: true });
    expect(result[0].annotation).toBe("line:1");
    expect(result[1].annotation).toBe("line:2");
  });

  it("combines multiple annotation parts", () => {
    const entries = [makeEntry("FOO")];
    const result = annotateEntries(
      entries,
      { ...baseOptions, label: "prod", showSource: true, showLineNumber: true },
      ".env.prod"
    );
    expect(result[0].annotation).toBe("prod | src:.env.prod | line:1");
  });
});
