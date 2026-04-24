import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { run } from './run';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `stackdiff-run-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('run()', () => {
  it('returns exitCode 1 when fewer than 2 files are provided', async () => {
    const result = await run({ files: [] });
    expect(result.exitCode).toBe(1);
    expect(result.output).toMatch(/at least two/);
  });

  it('returns exitCode 1 for a non-existent file', async () => {
    const result = await run({ files: ['/nonexistent/a.env', '/nonexistent/b.env'] });
    expect(result.exitCode).toBe(1);
    expect(result.output).toMatch(/Error reading files/);
  });

  it('reports no differences for identical files', async () => {
    const content = 'FOO=bar\nBAZ=qux\n';
    const a = writeTempEnv(content);
    const b = writeTempEnv(content);
    const result = await run({ files: [a, b], noColor: true });
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('No differences found.');
  });

  it('shows differences between two env files', async () => {
    const a = writeTempEnv('FOO=hello\nBAR=same\n');
    const b = writeTempEnv('FOO=world\nBAR=same\n');
    const result = await run({ files: [a, b], noColor: true });
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/FOO/);
  });

  it('filters to only changed entries when onlyChanged is set', async () => {
    const a = writeTempEnv('FOO=hello\nBAR=same\n');
    const b = writeTempEnv('FOO=world\nBAR=same\n');
    const result = await run({ files: [a, b], onlyChanged: true, noColor: true });
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/FOO/);
  });
});
