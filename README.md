# stackdiff

> CLI tool to compare and visualize environment variable differences across deployment configs

## Installation

```bash
npm install -g stackdiff
```

## Usage

Compare environment variables between two deployment config files:

```bash
stackdiff staging.env production.env
```

Example output:

```
  DB_HOST        staging-db.internal  →  prod-db.internal
+ NEW_RELIC_KEY  (missing)            →  abc123xyz
- DEBUG          true                 →  (missing)
  PORT           3000                    3000
```

You can also compare `.env`, `.json`, or YAML-based config files:

```bash
stackdiff config/staging.yaml config/production.yaml
stackdiff .env.staging .env.production --format json
```

### Options

| Flag | Description |
|------|-------------|
| `--format` | Output format: `text` (default), `json`, or `table` |
| `--only-diff` | Show only keys that differ |
| `--ignore <keys>` | Comma-separated list of keys to exclude |

## License

MIT © [stackdiff contributors](https://github.com/your-org/stackdiff)