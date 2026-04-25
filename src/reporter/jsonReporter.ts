import { DiffResult } from '../diff/envDiff';
import { ReportSummary, summarizeDiff } from './envReporter';

export interface JsonReport {
  generatedAt: string;
  summary: ReportSummary;
  diff: DiffResult[];
}

export function buildJsonReport(diff: DiffResult[]): JsonReport {
  return {
    generatedAt: new Date().toISOString(),
    summary: summarizeDiff(diff),
    diff,
  };
}

export function serializeJsonReport(report: JsonReport, pretty = true): string {
  return pretty ? JSON.stringify(report, null, 2) : JSON.stringify(report);
}

export function writeJsonReport(
  diff: DiffResult[],
  options: { pretty?: boolean } = {}
): string {
  const report = buildJsonReport(diff);
  return serializeJsonReport(report, options.pretty ?? true);
}
