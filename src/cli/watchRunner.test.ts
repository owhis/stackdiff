import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { startWatcher } from './watchRunner';
import type { WatchOptions } from './watchOptions';

const pollOptions: WatchOptions = {
  enabled: true,
  intervalMs: 50,
  mode: 'poll',
  clearOnChange: false,
};

function writeTempFile(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('startWatcher (poll mode)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects a file change and calls onChange', (done) => {
    const filePath = writeTempFile(tmpDir, 'a.env', 'FOO=bar');

    const watcher = startWatcher([filePath], pollOptions, (changed) => {
      expect(changed).toContain(filePath);
      watcher.stop();
      done();
    });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'FOO=baz', 'utf-8');
    }, 60);
  });

  it('does not call onChange when file is unchanged', (done) => {
    const filePath = writeTempFile(tmpDir, 'b.env', 'KEY=val');
    const spy = jest.fn();

    const watcher = startWatcher([filePath], pollOptions, spy);

    setTimeout(() => {
      watcher.stop();
      expect(spy).not.toHaveBeenCalled();
      done();
    }, 200);
  });

  it('stop() prevents further callbacks', (done) => {
    const filePath = writeTempFile(tmpDir, 'c.env', 'X=1');
    let callCount = 0;

    const watcher = startWatcher([filePath], pollOptions, () => {
      callCount++;
    });

    watcher.stop();

    setTimeout(() => {
      fs.writeFileSync(filePath, 'X=2', 'utf-8');
    }, 60);

    setTimeout(() => {
      expect(callCount).toBe(0);
      done();
    }, 200);
  });
});
