# Signing tool
Tool for signing uptime vote and rewards in FTSO V2 protocol.

##  Config file
Create an environment file (`.env`) with the following content (see `.env.example`):
- SIGNING_POLICY_PRIVATE_KEY - Private key of the signing policy address
- NETWORK - Network on which to sign (flare/songbird/coston/coston2)
- PRIVATE_KEY - Private key of the address that will send transactions (can be the same as the signing policy key but this is not recommended to avoid nonce conflict with other transactions, mainly relaying transactions).
- Optionally one can set custom RPC endpoints for each network that will override the public ones (e.g. for Flare network one should set FLARE_RPC=<private_rpc>)

## Build the tool
```bash
yarn build
```

## Signing uptime vote
```bash
bin/signing-tool uptime --reward-epoch-id <reward_epoch_id>
```

## Signing rewards
```bash
bin/signing-tool rewards --reward-epoch-id <reward_epoch_id>
```

