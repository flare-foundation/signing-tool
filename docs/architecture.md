# Architecture

## Overview

CLI tool for signing uptime votes and reward distributions in the Flare Systems Protocol. The tool communicates with the `FlareSystemsManager` smart contract on Flare-family networks.

The project is an ESM module (`"type": "module"` in package.json). All relative imports use `.js` extensions. Type-only imports use `import type`.

## File structure

```
bin/signing-tool              CLI entry point (dynamic import of dist/src/run.js)
src/
  run.ts                      Commander.js program setup, top-level error handler
  cli.ts                      Registers three subcommands: uptime, rewards, status
  sign.ts                     Core signing logic (signUptimeVote, signRewards)
  status.ts                   On-chain voting status queries
  prompts.ts                  Interactive Yes/No confirmations via inquirer
  utils.ts                    Validation (parseRewardEpochId, parseOptionalEpochId,
                              parseGasPriceMultiplier) and round utility
lib/
  ECDSASignature.ts           ECDSA signing (v, r, s) using Web3
  initialize.ts               Web3 instance and contract initialization
  interfaces.ts               TypeScript types for reward distribution data
configs/
  networks.ts                 RPC endpoints and contract addresses per network
  contracts.ts                Contract address type definitions
abi/
  FlareSystemsManager.json    Contract ABI
```

## Two ways to run

- `pnpm sign` — runs `tsx src/run.ts` directly from TypeScript source (development)
- `bin/signing-tool` — runs compiled JavaScript from `dist/` (production, requires `pnpm build`)

## Key separation

The tool uses two separate private keys:

- `SIGNING_POLICY_PRIVATE_KEY` — used for ECDSA signing of the message hash. This is the key that represents the data provider's voting weight.
- `PRIVATE_KEY` — used to send the transaction and pay gas. Recommended to be a separate key to avoid nonce collisions with Flare Systems Client.

Both must be `0x`-prefixed, 64 hex characters (32 bytes).
