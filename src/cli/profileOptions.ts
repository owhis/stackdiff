import { ParsedArgs } from 'minimist';

export interface ProfileOptions {
  profile: string | undefined;
  profileDir: string;
  listProfiles: boolean;
}

export function parseProfileName(args: ParsedArgs): string | undefined {
  const val = args['profile'] ?? args['p'];
  if (val === undefined || val === true || val === false) return undefined;
  return String(val).trim() || undefined;
}

export function parseProfileDir(args: ParsedArgs): string {
  const val = args['profile-dir'];
  if (val === undefined || val === true || val === false) {
    return '.stackdiff/profiles';
  }
  return String(val).trim() || '.stackdiff/profiles';
}

export function parseListProfiles(args: ParsedArgs): boolean {
  return args['list-profiles'] === true || args['list-profiles'] === 'true';
}

export function parseProfileOptions(args: ParsedArgs): ProfileOptions {
  return {
    profile: parseProfileName(args),
    profileDir: parseProfileDir(args),
    listProfiles: parseListProfiles(args),
  };
}

export interface ProfileConfig {
  name: string;
  files: string[];
  description?: string;
}

export function resolveProfileFiles(
  profile: ProfileConfig,
  cliFiles: string[]
): string[] {
  if (cliFiles.length > 0) return cliFiles;
  return profile.files;
}
