# Annotate Options

The `--annotate` flag enriches diff output with metadata about each entry, such as the source file, line position, or a custom label.

## Flags

| Flag                      | Alias | Description                                      |
|---------------------------|-------|--------------------------------------------------|
| `--annotate`              | `-a`  | Enable annotation mode                           |
| `--annotate-source`       |       | Include source filename in annotation            |
| `--annotate-line`         |       | Include 1-based line index in annotation         |
| `--annotate-label <name>` |       | Prefix each annotation with a custom label       |

## Examples

### Add a label to all entries

```bash
stackdiff .env.staging .env.prod --annotate --annotate-label prod
```

Output annotation: `prod`

### Show source file in annotation

```bash
stackdiff .env.staging .env.prod --annotate --annotate-source
```

Output annotation: `src:.env.prod`

### Combine label, source, and line number

```bash
stackdiff .env.staging .env.prod -a --annotate-label staging --annotate-source --annotate-line
```

Output annotation: `staging | src:.env.staging | line:4`

## Notes

- Annotations appear as a trailing metadata field in table and text output formats.
- In JSON output, annotations are included as an `annotation` property on each entry.
- If no annotation parts are configured, the `annotation` field will be `undefined`.
