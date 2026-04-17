# Configuration

## Environment variables

All configuration is via environment variables, loaded from `.env` via dotenv.

### Required

| Variable | Description |
|---|---|
| `NETWORK` | Network to operate on: `flare`, `songbird`, `coston`, `coston2` |
| `SIGNING_POLICY_PRIVATE_KEY` | Private key for ECDSA signing. `0x`-prefixed, 64 hex chars (32 bytes) |
| `PRIVATE_KEY` | Private key for sending transactions (gas). `0x`-prefixed, 64 hex chars (32 bytes). Should be different from `SIGNING_POLICY_PRIVATE_KEY` |

### Optional

| Variable | Default | Description |
|---|---|---|
| `GAS_PRICE_MULTIPLIER` | `10` | Multiplied with network gas price. Must be positive, max 100 |
| `FLARE_RPC` | `https://flare-api.flare.network/ext/bc/C/rpc` | Custom RPC endpoint for Flare |
| `SONGBIRD_RPC` | `https://songbird-api.flare.network/ext/bc/C/rpc` | Custom RPC endpoint for Songbird |
| `COSTON_RPC` | `https://coston-api.flare.network/ext/bc/C/rpc` | Custom RPC endpoint for Coston |
| `COSTON2_RPC` | `https://coston2-api.flare.network/ext/bc/C/rpc` | Custom RPC endpoint for Coston2 |

## Network contract addresses

Each network has a hardcoded `FlareSystemsManager` contract address:

| Network | Address |
|---|---|
| flare | `0x89e50DC0380e597ecE79c8494bAAFD84537AD0D4` |
| songbird | `0x421c69E22f48e14Fc2d2Ee3812c59bfb81c38516` |
| coston | `0x85680Dd93755Fe5d0789773fd0896cEE51F9e358` |
| coston2 | `0xbC1F76CEB521Eb5484b8943B5462D08ea96617A1` |

## Input validation

- Reward epoch ID must be a non-negative integer up to 16,777,215 (uint24 max) — applies to both `--reward-epoch-id` and `--first-reward-epoch-id`
- `GAS_PRICE_MULTIPLIER` must be a positive number up to 100
- Private keys must match the pattern `0x` followed by exactly 64 hex characters
- Fetched reward data is validated for correct format, type, and epoch ID match
- Before signing, the RPC's chain ID is compared against the expected chain ID for the configured `NETWORK` — a mismatch aborts with an error (prevents signing with a misconfigured RPC)

## Chain IDs

| Network | Chain ID |
|---|---|
| flare | 14 |
| songbird | 19 |
| coston | 16 |
| coston2 | 114 |
