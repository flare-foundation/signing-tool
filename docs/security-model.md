# Security model

## What the tool trusts

The tool assumes the following are not compromised:

- **The reward data source** — JSON fetched from GitHub (`flare-foundation/fsp-rewards`) or GitLab (`timivesel/ftsov2-testnet-rewards`) is trusted completely. The tool validates the format of `merkleRoot` but does **not** recompute it from the claims data. A compromise of the repository or a MITM attack on the HTTPS fetch could cause the tool to sign an attacker-chosen Merkle root.
- **The RPC endpoint** — values from `eth_gasPrice`, `eth_getTransactionCount`, and transaction receipts are used without cross-checks. A malicious RPC can report false values. The chain ID **is** verified against the configured `NETWORK` before signing (a mismatch aborts with an error).
- **The contract address** — hardcoded per network in `configs/networks.ts`. Not validated at runtime.
- **The user's confirmation** — the confirmation prompt is the primary barrier before signing. The default choice is "Yes".

## What the tool protects

- **Private keys** — read from environment variables and used in-memory only. Not written to disk. Only the sender's address (derived from `PRIVATE_KEY`) is logged, never the key material.
- **Input validation** — reward epoch IDs, gas price multipliers, and private key formats are validated before use.
- **Silent failures** — transaction errors are re-thrown with a non-zero exit code.

## Operational considerations

- The `.env` file containing private keys must be protected at the filesystem level. It is `.gitignored` but still present on disk.
- `.env` is loaded from the project root (resolved relative to the binary location), so the tool can be run from any directory.
- Custom RPC endpoints set via `<NETWORK>_RPC` env vars should use HTTPS — no scheme validation is enforced by the tool.
- Error messages may include details from Web3 error objects, which can contain the RPC URL (including any embedded API keys). Be cautious when sharing logs.
