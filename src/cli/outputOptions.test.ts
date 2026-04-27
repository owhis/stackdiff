import {
  parseOutputFormat,
  parseOutputOptions,
  OutputFormat,
} from "./outputOptions";

describe("parseOutputFormat", () => {
  it("defaults to text when undefined", () => {
    expect(parseOutputFormat(undefined)).toBe("text");
  });

  it.each([["text"], ["table"], ["json"]] as [OutputFormat][])("accepts valid format: %s", (fmt) => {
    expect(parseOutputFormat(fmt)).toBe(fmt);
  });

  it("normalizes uppercase input", () => {
    expect(parseOutputFormat("TABLE")).toBe("table");
    expect(parseOutputFormat("JSON")).toBe("json");
  });

  it("throws on invalid format", () => {
    expect(() => parseOutputFormat("csv")).toThrow(
      /Invalid output format "csv"/
    );
  });
});

describe("parseOutputOptions", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.NO_COLOR;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns defaults when no args provided", () => {
    const opts = parseOutputOptions({});
    expect(opts.format).toBe("text");
    expect(opts.outputFile).toBeUndefined();
    expect(opts.noColor).toBe(false);
  });

  it("parses format and output file", () => {
    const opts = parseOutputOptions({ format: "json", output: "out.json" });
    expect(opts.format).toBe("json");
    expect(opts.outputFile).toBe("out.json");
  });

  it("sets noColor from --no-color flag", () => {
    const opts = parseOutputOptions({ "no-color": true });
    expect(opts.noColor).toBe(true);
  });

  it("sets noColor when NO_COLOR env var is set", () => {
    process.env.NO_COLOR = "1";
    const opts = parseOutputOptions({});
    expect(opts.noColor).toBe(true);
  });

  it("throws when format is invalid", () => {
    expect(() => parseOutputOptions({ format: "xml" })).toThrow(
      /Invalid output format/
    );
  });
});
