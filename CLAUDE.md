# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
yarn install              # Install dependencies
yarn build                # Compile TypeScript to dist/ (uses tsconfig.build.json, excludes tests)
yarn typecheck            # Type-check without emitting (uses tsconfig.json, includes tests)
yarn compile              # Hardhat compile + TypeChain generation (ethers-v6, truffle-v5, web3-v1)
```

## Linting & Formatting

```bash
yarn lint:check           # ESLint check
yarn lint:fix             # ESLint auto-fix
yarn format:check         # Prettier check
yarn format:fix           # Prettier auto-fix
```

## Testing

```bash
yarn test                 # Run all tests via Hardhat (Mocha + Chai)
yarn test:coverage        # Run tests with NYC coverage
```

Tests require Hardhat's local network — there is no way to run a single test file separately since all tests are in `test/signingTool.test.ts`. Use `.only` on individual `describe`/`it` blocks to isolate tests.

## Architecture

CLI tool for signing uptime votes and reward distributions in the Flare Systems Protocol. Communicates with the `FlareSystemsManager` smart contract.

```
bin/signing-tool          → CLI entry (loads dist/src/run.js)
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
3. Constructs message: `rewardEpochId (64-bit hex) + hash`
4. Signs with `SIGNING_POLICY_PRIVATE_KEY` via ECDSA
5. Builds and sends transaction using `PRIVATE_KEY` (separate key for gas)

### Network configuration

Four networks: `flare`, `songbird`, `coston`, `coston2`. Configured via `NETWORK` env var. Each has default public RPC endpoints overridable by env vars (`FLARE_RPC`, `SONGBIRD_RPC`, etc.).

Reward data is fetched from GitHub (`flare-foundation/fsp-rewards`) for mainnet networks and GitLab (`timivesel/ftsov2-testnet-rewards`) for testnets.

### Testing setup

- `test/contracts/FlareSystemsManagerMock.sol` — mock contract with ECDSA verification
- `test/signingTool.test.ts` — full test suite using Hardhat local network with 1020 test accounts
- `hardhat.config.ts` — Solidity 0.8.20 (primary), sources in `test/contracts/`, mocha timeout 100M

### Build configurations

- `tsconfig.json` — full project (src, lib, test, hardhat.config.ts)
- `tsconfig.build.json` — production only (src, lib), used by `yarn build`
