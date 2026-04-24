import * as fs from 'fs';
import * as path from 'path';

export interface EnvMap {
  [key: string]: string;
}

export interface ParseResult {
  filePath: string;
  env: EnvMap;
  errors: string[];
}

/**
 * Parses a .env file and returns a key-value map.
 * Supports comments (#), blank lines, and quoted values.
 */
export function parseEnvFile(filePath: string): ParseResult {
  const absolutePath = path.resolve(filePath);
  const errors: string[] = [];
  const env: EnvMap = {};

  if (!fs.existsSync(absolutePath)) {
    return { filePath: absolutePath, env, errors: [`File not found: ${absolutePath}`] };
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      errors.push(`Line ${index + 1}: Missing '=' in "${trimmed}"`);
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) {
      errors.push(`Line ${index + 1}: Empty key`);
      return;
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  });

  return { filePath: absolutePath, env, errors };
}

/**
 * Parses multiple env files and returns their results.
 */
export function parseEnvFiles(filePaths: string[]): ParseResult[] {
  return filePaths.map(parseEnvFile);
}

/**
 * Merges multiple ParseResults into a single EnvMap.
 * Keys from later results override keys from earlier results.
 * Returns the merged map along with all collected errors.
 */
export function mergeEnvResults(results: ParseResult[]): { env: EnvMap; errors: string[] } {
  const env: EnvMap = {};
  const errors: string[] = [];

  for (const result of results) {
    errors.push(...result.errors);
    Object.assign(env, result.env);
  }

  return { env, errors };
}
