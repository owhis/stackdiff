export type OutputFormat = "text" | "table" | "json";

export interface OutputOptions {
  format: OutputFormat;
  outputFile?: string;
  noColor: boolean;
}

const VALID_FORMATS: OutputFormat[] = ["text", "table", "json"];

export function parseOutputFormat(value: string | undefined): OutputFormat {
  if (!value) return "text";
  const normalized = value.toLowerCase().trim();
  if (!VALID_FORMATS.includes(normalized as OutputFormat)) {
    throw new Error(
      `Invalid output format "${value}". Valid options: ${VALID_FORMATS.join(", ")}`
    );
  }
  return normalized as OutputFormat;
}

export function parseOutputOptions(
  args: Record<string, string | boolean | undefined>
): OutputOptions {
  const format = parseOutputFormat(args["format"] as string | undefined);
  const outputFile =
    typeof args["output"] === "string" ? args["output"] : undefined;
  const noColor =
    args["no-color"] === true ||
    args["noColor"] === true ||
    process.env.NO_COLOR !== undefined;

  return { format, outputFile, noColor };
}
