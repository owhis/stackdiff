# Redact Options

The `--redact` flag enables value redaction for sensitive environment variable keys in diff output.

## Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--redact` | boolean | `false` | Enable redaction of sensitive values |
| `--redact-keys` | string | `""` | Comma-separated list of keys to redact |
| `--redact-replacement` | string | `[REDACTED]` | Replacement string for redacted values |

## Usage

```bash
# Redact specific keys using default replacement
stackdiff .env.staging .env.prod --redact --redact-keys SECRET,API_KEY,TOKEN

# Use a custom replacement string
stackdiff .env.staging .env.prod --redact --redact-keys PASSWORD --redact-replacement "***"
```

## Behavior

- Redaction is **case-insensitive**: `api_key` matches `API_KEY`.
- Both `valueA` (left) and `valueB` (right) are replaced for matched keys.
- If a key is `undefined` (i.e., only present on one side), it remains `undefined` after redaction.
- Redaction is applied **after** diffing and filtering, so comparisons are unaffected.
- When `--redact` is omitted or no keys are provided, output is unchanged.

## Integration

`applyRedact` is called inside `handleOutput` after `filterEntries` and before rendering:

```ts
const redacted = applyRedact(filtered, redactOptions);
renderOutput(redacted, outputOptions);
```
