import * as fs from 'fs';
import * as path from 'path';
import { ProfileConfig } from './profileOptions';

export function loadProfileFile(profileDir: string, name: string): ProfileConfig {
  const filePath = path.join(profileDir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile "${name}" not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Profile "${name}" contains invalid JSON`);
  }
  return validateProfileConfig(name, parsed);
}

export function validateProfileConfig(name: string, data: unknown): ProfileConfig {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`Profile "${name}" must be a JSON object`);
  }
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj['files']) || obj['files'].length === 0) {
    throw new Error(`Profile "${name}" must have a non-empty "files" array`);
  }
  const files = (obj['files'] as unknown[]).map((f, i) => {
    if (typeof f !== 'string') throw new Error(`Profile "${name}" files[${i}] must be a string`);
    return f;
  });
  return {
    name,
    files,
    description: typeof obj['description'] === 'string' ? obj['description'] : undefined,
  };
}

export function listProfiles(profileDir: string): string[] {
  if (!fs.existsSync(profileDir)) return [];
  return fs
    .readdirSync(profileDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}
