import { formatDiff, DiffEntry } from "./envFormatter";

// Strip ANSI escape codes for assertion clarity
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, "");
}

const sampleEntries: DiffEntry[] = [
  { key: "API_URL", status: "changed", leftValue: "http://old", rightValue: "http://new" },
  { key: "NEW_KEY", status: "added", rightValue: "value1" },
  { key: "OLD_KEY", status: "removed", leftValue: "value2" },
  { key: "SAME_KEY", status: "unchanged", leftValue: "same" },
];

describe("formatDiff", () => {
  it("excludes unchanged entries by default", () => {
    const output = stripAnsi(formatDiff(sampleEntries));
    expect(output).not.toContain("SAME_KEY");
    expect(output).toContain("API_URL");
    expect(output).toContain("NEW_KEY");
    expect(output).toContain("OLD_KEY");
  });

  it("includes unchanged entries when showUnchanged is true", () => {
    const output = stripAnsi(formatDiff(sampleEntries, { showUnchanged: true }));
    expect(output).toContain("SAME_KEY");
  });

  it("formats changed entry with arrow", () => {
    const output = stripAnsi(formatDiff(sampleEntries));
    expect(output).toContain("API_URL: http://old → http://new");
  });

  it("formats added entry with + symbol", () => {
    const output = stripAnsi(formatDiff(sampleEntries));
    expect(output).toContain("+ NEW_KEY=value1");
  });

  it("formats removed entry with - symbol", () => {
    const output = stripAnsi(formatDiff(sampleEntries));
    expect(output).toContain("- OLD_KEY=value2");
  });

  it("returns no-differences message when diff is empty", () => {
    const output = stripAnsi(formatDiff([]));
    expect(output).toBe("No differences found.");
  });

  it("omits summary line in compact mode", () => {
    const output = stripAnsi(formatDiff(sampleEntries, { compact: true }));
    expect(output).not.toContain("difference(s) found");
  });

  it("includes summary line in non-compact mode", () => {
    const output = stripAnsi(formatDiff(sampleEntries));
    expect(output).toContain("difference(s) found");
  });

  it("does not apply color when colorize is false", () => {
    const output = formatDiff(sampleEntries, { colorize: false });
    expect(output).not.toMatch(/\x1B\[/);
  });
});
