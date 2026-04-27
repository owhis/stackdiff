import * as fs from 'fs';
import type { WatchOptions } from './watchOptions';

export type WatchCallback = (changedPaths: string[]) => void | Promise<void>;

interface Watcher {
  stop: () => void;
}

function pollFiles(
  paths: string[],
  intervalMs: number,
  onChange: WatchCallback
): Watcher {
  const mtimes = new Map<string, number>();

  for (const p of paths) {
    try {
      mtimes.set(p, fs.statSync(p).mtimeMs);
    } catch {
      mtimes.set(p, 0);
    }
  }

  const timer = setInterval(() => {
    const changed: string[] = [];
    for (const p of paths) {
      try {
        const mtime = fs.statSync(p).mtimeMs;
        if (mtime !== mtimes.get(p)) {
          mtimes.set(p, mtime);
          changed.push(p);
        }
      } catch {
        // file removed or unreadable
      }
    }
    if (changed.length > 0) {
      void onChange(changed);
    }
  }, intervalMs);

  return { stop: () => clearInterval(timer) };
}

function nativeWatch(paths: string[], onChange: WatchCallback): Watcher {
  const watchers = paths.map((p) =>
    fs.watch(p, () => void onChange([p]))
  );
  return { stop: () => watchers.forEach((w) => w.close()) };
}

export function startWatcher(
  paths: string[],
  options: WatchOptions,
  onChange: WatchCallback
): Watcher {
  if (options.mode === 'poll') {
    return pollFiles(paths, options.intervalMs, onChange);
  }
  return nativeWatch(paths, onChange);
}
