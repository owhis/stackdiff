# Mask Options

The `maskOptions` module controls how sensitive environment variable values are redacted in `stackdiff` output.

## CLI Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--mask` / `--no-mask` | boolean | `true` | Enable or disable value masking |
| `--mask-char` | string | `*` | Character used to replace masked characters |
| `--reveal-count` | number | `0` | Number of trailing characters to reveal |
| `--mask-patterns` | string | built-in | Comma-separated regex patterns to match sensitive keys |

## Default Sensitive Patterns

The following key name patterns are masked by default (case-insensitive):

- `secret`
- `password` / `passwd`
- `token`
- `api_key` / `apikey`
- `private_key`
- `auth`
- `credential`

## Examples

```bash
# Mask with defaults
stackdiff .env.staging .env.production

# Disable masking
stackdiff --no-mask .env.staging .env.production

# Show last 4 characters of masked values
stackdiff --reveal-count=4 .env.staging .env.production

# Use a custom mask character
stackdiff --mask-char='#' .env.staging .env.production

# Override sensitive patterns
stackdiff --mask-patterns='secret,key,token' .env.staging .env.production
```

## API

```ts
import { parseMaskOptions, maskValue } from './maskOptions';

const options = parseMaskOptions(argv);
const safe = maskValue('DB_PASSWORD', rawValue, options);
```
