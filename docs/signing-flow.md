# Signing flow

## Uptime vote

1. User runs `bin/signing-tool uptime --reward-epoch-id <id>`
2. `parseRewardEpochId` validates the ID is an integer in range 0-16,777,215 (uint24)
3. Web3 is initialized using the RPC endpoint for the configured `NETWORK`
4. Uptime vote hash is computed: `keccak256(ZERO_BYTES32)` (a fixed constant, not a real uptime Merkle root)
5. User is prompted to confirm
6. Message is constructed: `rewardEpochId` (256-bit zero-padded hex) + `uptimeVoteHash` (32 bytes)
7. Message is hashed: `keccak256(message)`
8. Hash is signed with `SIGNING_POLICY_PRIVATE_KEY` via ECDSA (produces v, r, s)
9. Transaction is built calling `FlareSystemsManager.signUptimeVote(rewardEpochId, uptimeVoteHash, signature)`
10. Transaction is signed with `PRIVATE_KEY` and sent
11. On success: prints confirmation. On failure: logs the error and re-throws (non-zero exit)

## Rewards

1. User runs `bin/signing-tool rewards --reward-epoch-id <id>`
2. `parseRewardEpochId` validates the ID
3. Reward distribution data is fetched from GitHub (mainnet) or GitLab (testnet) with a 30s timeout
4. Response is validated:
   - `merkleRoot` must be a `0x`-prefixed 32-byte hex string
   - `noOfWeightBasedClaims` must be a non-negative integer
   - `rewardEpochId` in the response must match the requested epoch
5. User is prompted to confirm (shown the Merkle root and claims count)
6. Web3 is initialized
7. Chain ID is fetched via `eth_chainId`
8. A single-element array `[[chainId, noOfWeightBasedClaims]]` is ABI-encoded as `tuple(uint256,uint256)[]`, then keccak256-hashed → `noOfWeightBasedClaimsHash`
9. Message is constructed: `rewardEpochId` (256-bit) + `noOfWeightBasedClaimsHash` (32 bytes) + `rewardsHash` (32 bytes)
10. Message is hashed and signed (same as uptime)
11. Transaction is built calling `FlareSystemsManager.signRewards(rewardEpochId, [[chainId, noOfWeightBasedClaims]], rewardsHash, signature)`
12. Transaction is signed and sent

If the user answers "No" to the prompt, the command exits silently with code 0.

## Status

1. User runs `bin/signing-tool status [--first-reward-epoch-id <id>]`
2. `parseOptionalEpochId` validates the ID if provided (non-negative integer); missing flag becomes `NaN`
3. Web3 is initialized
4. `getCurrentRewardEpochId()` is called on `FlareSystemsManager`
5. Epoch range computed by `getEpochRange`:
   - If no ID: `[max(0, current - 4), current]` (up to 5 most recent epochs)
   - If ID provided: `[id, current]`
6. For each epoch in range, calls `uptimeVoteHash(epoch)` and `rewardsHash(epoch)` and prints YES/NO depending on whether the hash is non-zero

## Gas price

The gas price is set to `networkGasPrice * GAS_PRICE_MULTIPLIER`. The multiplier defaults to 10 if `GAS_PRICE_MULTIPLIER` is not set. It must be a positive number up to 100. The gas limit is hardcoded at 500,000.

## Reward data sources

| Network | Source |
|---|---|
| flare | `https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/flare/` |
| songbird | `https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/songbird/` |
| coston | `https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston/` |
| coston2 | `https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston2/` |
