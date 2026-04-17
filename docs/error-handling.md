# Error handling

## Exit codes

- **0** — success, or user answered "No" to the confirmation prompt
- **1** — any error (validation failure, transaction revert, network error, missing env vars)

## Error flow

1. Functions in `src/sign.ts` throw on validation errors and re-throw on transaction errors after logging
2. Commander action handlers in `src/cli.ts` do not catch — errors propagate up
3. `src/run.ts` catches all errors from `program.parseAsync()`:
   - `Error` instances: logs `Error: <message>` to stderr
   - Other values: logs `Error: <string representation>` to stderr
   - Sets `process.exitCode = 1`

## Transaction errors

When `sendSignedTransaction` fails (e.g. contract reverts with "already signed"):

1. The error is caught inside `signUptimeVote`/`signRewards`
2. The error message is extracted and logged to stderr:
   - Web3 `innerError.message` (if present)
   - Error `reason` string (if present)
   - `String(e)` fallback
3. The error is re-thrown to the caller
4. The process exits with code 1

## Validation errors

These throw immediately with a descriptive message:

- Missing `PRIVATE_KEY` or `SIGNING_POLICY_PRIVATE_KEY`
- Missing or unsupported `NETWORK`
- Chain ID mismatch between RPC and configured `NETWORK`
- Invalid reward epoch ID (not integer, negative, above uint24 max)
- Invalid fetched reward data (bad merkle root format, non-integer claims count, epoch mismatch)
- Invalid `GAS_PRICE_MULTIPLIER` (NaN, non-positive, above 100)
- Invalid private key format (not 0x + 64 hex)
- Invalid message hash format
