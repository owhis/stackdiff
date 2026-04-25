import { buildJsonReport, serializeJsonReport, writeJsonReport } from './jsonReporter';
import { DiffResult } from '../diff/envDiff';

const sampleDiff: DiffResult[] = [
  { key: 'API_URL', status: 'changed', leftValue: 'http://old', rightValue: 'http://new' },
  { key: 'DEBUG', status: 'added', leftValue: undefined, rightValue: 'true' },
  { key: 'LEGACY', status: 'removed', leftValue: 'yes', rightValue: undefined },
];

describe('buildJsonReport', () => {
  it('includes generatedAt timestamp', () => {
    const report = buildJsonReport(sampleDiff);
    expect(report.generatedAt).toBeTruthy();
    expect(new Date(report.generatedAt).toString()).not.toBe('Invalid Date');
  });

  it('embeds the diff array', () => {
    const report = buildJsonReport(sampleDiff);
    expect(report.diff).toHaveLength(3);
    expect(report.diff[0].key).toBe('API_URL');
  });

  it('includes a summary', () => {
    const report = buildJsonReport(sampleDiff);
    expect(report.summary.totalKeys).toBe(3);
    expect(report.summary.changedCount).toBe(1);
    expect(report.summary.addedCount).toBe(1);
    expect(report.summary.removedCount).toBe(1);
  });
});

describe('serializeJsonReport', () => {
  it('produces valid JSON', () => {
    const report = buildJsonReport(sampleDiff);
    const json = serializeJsonReport(report);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('pretty-prints by default', () => {
    const report = buildJsonReport(sampleDiff);
    const pretty = serializeJsonReport(report, true);
    expect(pretty).toContain('\n');
  });

  it('compacts when pretty=false', () => {
    const report = buildJsonReport(sampleDiff);
    const compact = serializeJsonReport(report, false);
    expect(compact).not.toContain('\n');
  });
});

describe('writeJsonReport', () => {
  it('returns a JSON string with summary and diff', () => {
    const output = writeJsonReport(sampleDiff);
    const parsed = JSON.parse(output);
    expect(parsed.summary).toBeDefined();
    expect(parsed.diff).toHaveLength(3);
  });
});
