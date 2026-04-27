import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  parseProfileName,
  parseProfileDir,
  parseListProfiles,
  parseProfileOptions,
  resolveProfileFiles,
} from './profileOptions';
import { loadProfileFile, validateProfileConfig, listProfiles } from './profileLoader';

function args(obj: Record<string, unknown>) {
  return { _: [], ...obj } as any;
}

describe('parseProfileName', () => {
  it('returns profile name from --profile', () => {
    expect(parseProfileName(args({ profile: 'staging' }))).toBe('staging');
  });
  it('returns profile name from -p shorthand', () => {
    expect(parseProfileName(args({ p: 'prod' }))).toBe('prod');
  });
  it('returns undefined when not provided', () => {
    expect(parseProfileName(args({}))).toBeUndefined();
  });
  it('returns undefined for boolean flag', () => {
    expect(parseProfileName(args({ profile: true }))).toBeUndefined();
  });
});

describe('parseProfileDir', () => {
  it('returns custom dir when provided', () => {
    expect(parseProfileDir(args({ 'profile-dir': './configs' }))).toBe('./configs');
  });
  it('returns default when not provided', () => {
    expect(parseProfileDir(args({}))).toBe('.stackdiff/profiles');
  });
});

describe('parseListProfiles', () => {
  it('returns true when flag set', () => {
    expect(parseListProfiles(args({ 'list-profiles': true }))).toBe(true);
  });
  it('returns false when not set', () => {
    expect(parseListProfiles(args({}))).toBe(false);
  });
});

describe('parseProfileOptions', () => {
  it('combines all options', () => {
    const result = parseProfileOptions(args({ profile: 'dev', 'list-profiles': true }));
    expect(result.profile).toBe('dev');
    expect(result.listProfiles).toBe(true);
    expect(result.profileDir).toBe('.stackdiff/profiles');
  });
});

describe('resolveProfileFiles', () => {
  const profile = { name: 'dev', files: ['.env.dev', '.env.base'] };
  it('uses cli files when provided', () => {
    expect(resolveProfileFiles(profile, ['.env.custom'])).toEqual(['.env.custom']);
  });
  it('falls back to profile files', () => {
    expect(resolveProfileFiles(profile, [])).toEqual(['.env.dev', '.env.base']);
  });
});

describe('loadProfileFile / listProfiles', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-profile-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads a valid profile', () => {
    const data = { files: ['.env.a', '.env.b'], description: 'test' };
    fs.writeFileSync(path.join(tmpDir, 'staging.json'), JSON.stringify(data));
    const profile = loadProfileFile(tmpDir, 'staging');
    expect(profile.name).toBe('staging');
    expect(profile.files).toEqual(['.env.a', '.env.b']);
    expect(profile.description).toBe('test');
  });

  it('throws for missing profile', () => {
    expect(() => loadProfileFile(tmpDir, 'missing')).toThrow(/not found/);
  });

  it('throws for invalid JSON', () => {
    fs.writeFileSync(path.join(tmpDir, 'bad.json'), 'not json');
    expect(() => loadProfileFile(tmpDir, 'bad')).toThrow(/invalid JSON/);
  });

  it('lists profiles in directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'prod.json'), JSON.stringify({ files: ['.env'] }));
    fs.writeFileSync(path.join(tmpDir, 'dev.json'), JSON.stringify({ files: ['.env'] }));
    expect(listProfiles(tmpDir)).toEqual(['dev', 'prod']);
  });

  it('returns empty list for missing dir', () => {
    expect(listProfiles('/nonexistent/dir')).toEqual([]);
  });

  it('validateProfileConfig throws on missing files array', () => {
    expect(() => validateProfileConfig('x', { files: [] })).toThrow(/non-empty/);
  });
});
