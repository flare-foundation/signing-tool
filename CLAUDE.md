# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install              # Install dependencies
pnpm build                # Compile TypeScript to dist/ (uses tsconfig.build.json, excludes tests)
pnpm typecheck            # Type-check without emitting (uses tsconfig.json, includes tests)
pnpm compile              # Hardhat compile (Solidity)
```

## Linting & Formatting

```bash
pnpm lint:check           # ESLint check
pnpm lint:fix             # ESLint auto-fix
pnpm format:check         # Prettier check
pnpm format:fix           # Prettier auto-fix
```

## Testing

```bash
pnpm test                 # Run all tests via Hardhat (Mocha + Chai)
pnpm test:coverage        # Run tests with NYC coverage
```

Tests require Hardhat's local network — there is no way to run a single test file separately since all tests are in `test/signingTool.test.ts`. Use `.only` on individual `describe`/`it` blocks to isolate tests.

## Verification checklist

After every change, run all of these before reporting the task as done:

```bash
pnpm build                                                    # TypeScript compiles to dist/
pnpm lint:check                                               # No ESLint errors
pnpm format:check                                             # Prettier formatting correct
pnpm test                                                     # All Hardhat tests pass
node bin/signing-tool --help                                   # CLI binary loads and shows help
NETWORK=coston node bin/signing-tool status                    # status command queries on-chain data
NETWORK=coston node bin/signing-tool uptime -r 5456            # uptime command shows signing prompt
NETWORK=coston node bin/signing-tool rewards -r 5456           # rewards command shows signing prompt
```

The unit tests alone are NOT sufficient — they run inside Hardhat's process and do not exercise the compiled `dist/` output or the `bin/signing-tool` entry point. A broken build or entry point will pass all tests but produce a non-functional CLI.

Before committing, check if new or changed code needs new tests. Every validation path, error path, and new function should have test coverage. If logic is inside a callback (e.g. Commander action handlers), extract it into a testable function.

## Architecture

CLI tool for signing uptime votes and reward distributions in the Flare Systems Protocol. Communicates with the `FlareSystemsManager` smart contract.

ESM project (`"type": "module"` in package.json). All relative imports use `.js` extensions. Type-only imports use `import type`.

```
bin/signing-tool          → CLI entry (ESM, dynamic import of dist/src/run.js)
src/run.ts                → Commander.js setup
src/cli.ts                → Command routing: uptime | rewards | status
src/sign.ts               → Core signing logic (signUptimeVote, signRewards)
src/status.ts             → On-chain voting status queries
src/prompts.ts            → Interactive confirmations via inquirer
lib/ECDSASignature.ts     → ECDSA signing (v, r, s) using Web3
lib/initialize.ts         → Web3 & contract instance creation
lib/interfaces.ts         → Types: IRewardDistributionData, IRewardClaim, ClaimType
configs/networks.ts       → RPC endpoints & contract addresses per network
configs/contracts.ts      → Contract address type definitions
abi/FlareSystemsManager.json → Contract ABI
```

### Signing flow

1. CLI receives `--reward-epoch-id`
2. For uptime: hashes zero bytes; for rewards: fetches data from GitHub/GitLab
3. Constructs message: for uptime `rewardEpochId (256-bit padded hex) + uptimeVoteHash`; for rewards `rewardEpochId + noOfWeightBasedClaimsHash + rewardsHash`
4. Signs with `SIGNING_POLICY_PRIVATE_KEY` via ECDSA
5. Builds and sends transaction using `PRIVATE_KEY` (separate key for gas)

### Network configuration

Four networks: `flare`, `songbird`, `coston`, `coston2`. Configured via `NETWORK` env var. Each has default public RPC endpoints overridable by env vars (`FLARE_RPC`, `SONGBIRD_RPC`, etc.).

Reward data is fetched from GitHub (`flare-foundation/fsp-rewards`) for mainnet networks and GitLab (`timivesel/ftsov2-testnet-rewards`) for testnets.

### Testing setup

- Hardhat 3 with `@nomicfoundation/hardhat-ethers`, `hardhat-mocha`, `hardhat-ethers-chai-matchers`
- `test/contracts/FlareSystemsManagerMock.sol` — mock contract with ECDSA verification
- `test/signingTool.test.ts` — full test suite using Hardhat EDR-simulated network with 1020 test accounts
- `hardhat.config.ts` — uses `defineConfig()`, plugins array, `default` network (not `hardhat`), Solidity 0.8.20
- Tests get `ethers` via `hre.network.connect()` and create a `Web3` instance from `connection.provider`
- No TypeChain — mock contract interface is defined manually in the test file

### Build configurations

- `tsconfig.json` — full project (src, lib, test, hardhat.config.ts), `module: "node20"`, `verbatimModuleSyntax: true`
- `tsconfig.build.json` — production only (src, lib), used by `pnpm build`
