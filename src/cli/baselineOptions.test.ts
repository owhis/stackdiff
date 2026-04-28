import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  parseBaselineFile,
  parseSaveBaseline,
  parseBaselineDir,
  parseBaselineOptions,
  resolveBaselinePath,
  ensureBaselineDir,
} from "./baselineOptions";
import {
  buildSnapshot,
  saveBaseline,
  loadBaseline,
  diffAgainstBaseline,
} from "./baselineRunner";

describe("parseBaselineFile", () => {
  it("returns null when not provided", () => {
    expect(parseBaselineFile([])).toBeNull();
  });

  it("returns the value after --baseline", () => {
    expect(parseBaselineFile(["--baseline", "snap.json"])).toBe("snap.json");
  });
});

describe("parseSaveBaseline", () => {
  it("returns false when flag absent", () => {
    expect(parseSaveBaseline([])).toBe(false);
  });

  it("returns true when --save-baseline present", () => {
    expect(parseSaveBaseline(["--save-baseline"])).toBe(true);
  });
});

describe("parseBaselineDir", () => {
  it("defaults to .stackdiff", () => {
    expect(parseBaselineDir([])).toBe(".stackdiff");
  });

  it("returns provided dir", () => {
    expect(parseBaselineDir(["--baseline-dir", "snapshots"])).toBe("snapshots");
  });
});

describe("parseBaselineOptions", () => {
  it("parses all options together", () => {
    const opts = parseBaselineOptions(["--save-baseline", "--baseline-dir", "snaps"]);
    expect(opts.saveBaseline).toBe(true);
    expect(opts.baselineDir).toBe("snaps");
    expect(opts.baselineFile).toBeNull();
  });
});

describe("baseline save/load/diff", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stackdiff-baseline-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("saves and loads a baseline snapshot", () => {
    const opts = parseBaselineOptions(["--baseline-dir", tmpDir]);
    const envMap = new Map([["FOO", "bar"], ["BAZ", "qux"]]);
    const snapshot = buildSnapshot(["prod.env"], envMap);
    saveBaseline(opts, "prod", snapshot);
    const loaded = loadBaseline(opts, "prod");
    expect(loaded).not.toBeNull();
    expect(loaded!.entries).toEqual({ FOO: "bar", BAZ: "qux" });
    expect(loaded!.files).toEqual(["prod.env"]);
  });

  it("returns null when baseline does not exist", () => {
    const opts = parseBaselineOptions(["--baseline-dir", tmpDir]);
    expect(loadBaseline(opts, "missing")).toBeNull();
  });

  it("diffs correctly against baseline", () => {
    const snapshot = buildSnapshot(["a.env"], new Map([["FOO", "old"], ["GONE", "yes"]]));
    const current = new Map([["FOO", "new"], ["ADDED", "val"]]);
    const diff = diffAgainstBaseline(snapshot, current);
    const statuses = Object.fromEntries(diff.map((e) => [e.key, e.status]));
    expect(statuses["FOO"]).toBe("changed");
    expect(statuses["GONE"]).toBe("removed");
    expect(statuses["ADDED"]).toBe("added");
  });
});
