import { parseEnvFiles } from '../parser';
import { diffEnvMaps, filterDiff } from '../diff';
import { formatDiff } from '../formatter';
import * as path from 'path';

export interface RunOptions {
  files: string[];
  onlyChanged?: boolean;
  onlyMissing?: boolean;
  noColor?: boolean;
}

export interface RunResult {
  output: string;
  exitCode: number;
}

export async function run(options: RunOptions): Promise<RunResult> {
  const { files, onlyChanged = false, onlyMissing = false, noColor = false } = options;

  if (files.length < 2) {
    return {
      output: 'Error: at least two env files are required for comparison.',
      exitCode: 1,
    };
  }

  let envMaps: Map<string, string>[];
  try {
    envMaps = await parseEnvFiles(files);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      output: `Error reading files: ${message}`,
      exitCode: 1,
    };
  }

  const labels = files.map((f) => path.basename(f));
  let diff = diffEnvMaps(envMaps, labels);

  if (onlyChanged || onlyMissing) {
    diff = filterDiff(diff, { onlyChanged, onlyMissing });
  }

  if (diff.length === 0) {
    return {
      output: 'No differences found.',
      exitCode: 0,
    };
  }

  const output = formatDiff(diff, { noColor });
  return { output, exitCode: 0 };
}
