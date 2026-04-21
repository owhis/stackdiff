import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseEnvFile, parseEnvFiles } from './envParser';

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `stackdiff-test-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('parseEnvFile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses basic key=value pairs', () => {
    const file = writeTempEnv('APP_NAME=stackdiff\nPORT=3000\n');
    const result = parseEnvFile(file);
    expect(result.errors).toHaveLength(0);
    expect(result.env).toEqual({ APP_NAME: 'stackdiff', PORT: '3000' });
    fs.unlinkSync(file);
  });

  it('ignores comments and blank lines', () => {
    const file = writeTempEnv('# comment\n\nFOO=bar\n');
    const result = parseEnvFile(file);
    expect(result.env).toEqual({ FOO: 'bar' });
    expect(result.errors).toHaveLength(0);
    fs.unlinkSync(file);
  });

  it('strips surrounding quotes from values', () => {
    const file = writeTempEnv('SECRET="my secret"\nTOKEN=\'abc123\'\n');
    const result = parseEnvFile(file);
    expect(result.env.SECRET).toBe('my secret');
    expect(result.env.TOKEN).toBe('abc123');
    fs.unlinkSync(file);
  });

  it('reports error for missing = sign', () => {
    const file = writeTempEnv('INVALID_LINE\n');
    const result = parseEnvFile(file);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Missing '='");
    fs.unlinkSync(file);
  });

  it('returns error when file does not exist', () => {
    const result = parseEnvFile('/nonexistent/path/.env');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('File not found');
    expect(result.env).toEqual({});
  });
});

describe('parseEnvFiles', () => {
  it('parses multiple files and returns array of results', () => {
    const file1 = writeTempEnv('A=1\n');
    const file2 = writeTempEnv('B=2\n');
    const results = parseEnvFiles([file1, file2]);
    expect(results).toHaveLength(2);
    expect(results[0].env).toEqual({ A: '1' });
    expect(results[1].env).toEqual({ B: '2' });
    fs.unlinkSync(file1);
    fs.unlinkSync(file2);
  });
});
