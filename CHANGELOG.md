# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [[v1.2.0](https://github.com/flare-foundation/signing-tool/tags/v1.2.0)] - 2026-04-16

### Changed

- Migrated to Hardhat 3 (`defineConfig`, explicit plugin registration, `default` network, `type` field on networks)
- Migrated to ESM (`"type": "module"`, `.js` import extensions, `import type` for type-only imports)
- Aligned tsconfig.json with Flare handbook (`module: "node20"`, `verbatimModuleSyntax`, `lib`, `types`)
- Upgraded chai 4 → 5, mocha 10 → 11, inquirer 8 → 12, @types/node 16 → 22
- Replaced ts-node with tsx
- Removed TypeChain (incompatible with Hardhat 3 artifact format)
- Moved nyc config from package.json to `.c8rc.json`; replaced nyc with c8
- Added `minimumReleaseAge` to pnpm-workspace.yaml (7-day supply chain guard)

### Fixed

- Transaction errors are now re-thrown after logging (process exits non-zero on failure)
- Fetched reward data validated at runtime (merkle root format, epoch ID match, claims count)
- `rewardEpochId` validated as integer in uint24 range (0–16,777,215)
- `GAS_PRICE_MULTIPLIER` validated: rejects NaN, negative, zero, and values above 100
- Floating point crash in gas price BigInt conversion (`Math.round` before `BigInt`)
- ABI file loaded relative to module location, not working directory
- `pnpm sign` script points to `src/run.ts` (was no-op pointing to `src/sign.ts`)
- Nonce uses bigint `toString()` directly (avoids precision loss above 2^53)
- RPC paths in hardhat config match production config (`/ext/bc/C/rpc`)
- SECURITY.md advisory link points to signing-tool repo (was fassets)
- Status command rejects invalid `--first-reward-epoch-id` input
- Status command clamps start epoch to 0 when current epoch < 4
- Non-Error exceptions logged and exit code set to 1 in top-level handler
- Errors written to stderr instead of stdout
- 30s timeout on axios reward data fetch
- Removed `console.dir(e)` from error handlers (could leak RPC URLs with API keys)
- README: hash algorithm corrected to keccak256
- CLAUDE.md: epoch encoding corrected to 256-bit, rewards message description fixed

### Removed

- `@typechain/hardhat`, `@typechain/ethers-v6`, `typechain`, `ts-node`
- `@types/chai`, `@types/inquirer`, `@types/lodash` (now shipped by packages or unused)
- `@nomicfoundation/hardhat-web3-v4` (dropped in Hardhat 3)

## [[v1.1.0](https://github.com/flare-foundation/signing-tool/tags/v1.1.0)] - 2026-04-01

### Changed

- Migrated from yarn to pnpm
- Migrated test infrastructure from Truffle to ethers.js
- Updated Node.js requirement to v24+
- Updated tsconfig.json target to es2024, TypeScript to v5
- Renamed npm scripts to match Flare handbook conventions (`lint:check`, `lint:fix`, `format:check`, `format:fix`, `test`)
- Added ESLint and Prettier with Flare shared configs
- Added GitLab CI pipeline with lint, format, test, and build stages
- Added CONTRIBUTING.md, SECURITY.md, CHANGELOG.md, CODEOWNERS, CLAUDE.md
- Removed deprecated Truffle dependencies

## [[v1.0.0](https://github.com/flare-foundation/signing-tool/tags/v1.0.0)] - 2026-03-13

Initial release. Flare Systems Protocol uptime and rewards signing tool.
