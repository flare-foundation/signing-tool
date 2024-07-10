# Signing tool

Tool for signing uptime vote and rewards in FTSO V2 protocol.

##  Config file
NOTE: Ensure that you work in a secure environment (server).

Create an environment file (`.env`) with the following content (see `.env_template`):
- `SIGNING_POLICY_PRIVATE_KEY` - Private key of the signing policy address. Private key should be prefixed with `0x`.
- `NETWORK` - Network on which to sign (`flare`, `songbird`, `coston`, `coston2`).
- `PRIVATE_KEY` - Private key of the address that will be used to send transactions (recommended not to be the same as `SIGNING_POLICY_PRIVATE_KEY` to avoid nonce issues since the signing policy address is used for finalizations by [Flare Systems Client](https://github.com/flare-foundation/flare-system-client)). Recommended to use a private key, distinct of any data provider entity keys, specifically used for sending transactions and paying gas. Private key should be prefixed with `0x`.
- Optionally one can set custom RPC endpoints for each network that will override the public ones (e.g. for Flare network one should set `FLARE_RPC=<private_rpc>`, for others use `SONGBIRD_RPC`, `COSTON_RPC`, `COSTON2_RPC`).

A data provider is encouraged to use more advanced approaches like cloud key management tools to initialize specific environment variables more securely.

## Build the tool

Recommended Node.js versions are 18-20.x.x.
- Clone the repo.
- Install dependencies:
```bash
yarn
```
- Build the tool:
```bash
yarn build
```

## Signing uptime vote

Signs hash-of-zero Merkle root and sends it as a vote for uptime voting to `FlareSystemsManager`.

```bash
bin/signing-tool uptime --reward-epoch-id <reward_epoch_id>
```

## Signing rewards

Fetches the reward distribution data from [reward calculation results](https://github.com/flare-foundation/FTSO-Scaling/tree/main/rewards-data). It prints out the data and once confirmed it signs them with `SIGNING_POLICY_PRIVATE_KEY` and sends them to `FlareSystemsManager` smart contract.

```bash
bin/signing-tool rewards --reward-epoch-id <reward_epoch_id>
```

## Signing status check

Checks the signing status for both uptime vote and reward
```bash
bin/signing-tool status --reward-epoch-id <reward_epoch_id>
```

## Technical details

The tool communicates with [`FlareSystemsManager`](https://gitlab.com/flarenetwork/flare-smart-contracts-v2/-/blob/main/contracts/protocol/implementation/FlareSystemsManager.sol?ref_type=heads) smart contract that handles the steps in the Flare Systems Protocol.
The part of the protocol immediately after the end of each reward epoch includes voting for uptime and voting for rewards by data providers that held voting weight in the reward epoch.

The tool handles two actions:
- signing and sending Merkle root for up time voting,
- signing and sending Merkle root for the reward distribution.

Note that signing and sending constitute voting for the signed Merkle root with the signers weight. The vote is concluded once 50%+ of the weight votes for the same Merkle root.

### Uptime voting

In current deployments uptime voting is not fully supported and used. But since Flare Systems Protocol requires concluded uptime voting in order to start reward distribution voting the data providers have to sign Merkle root which is the hash (sha256). The method [`signUptimeVote`](https://gitlab.com/flarenetwork/flare-smart-contracts-v2/-/blob/main/contracts/protocol/implementation/FlareSystemsManager.sol?ref_type=heads#L460) on `FlareSystemsManager` smart contract is used.

### Reward distribution voting

Currently Flare calculates rewards using the [reward calculation algorithm](https://github.com/flare-foundation/FTSO-Scaling/blob/main/scripts/rewards/README.md) and publishes the [results](https://github.com/flare-foundation/FTSO-Scaling/tree/main/rewards-data). If data providers agree on those results they can sign them using the Signing tool as described above. The method [signRewards](https://github.com/flare-foundation/flare-smart-contracts-v2/blob/main/contracts/protocol/implementation/FlareSystemsManager.sol#L504) is used on `FlareSystemsManager` smart contract.


