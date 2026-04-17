import type { NetworkContractAddresses } from "./contracts.js";
import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

const COSTON_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0x85680Dd93755Fe5d0789773fd0896cEE51F9e358" },
};

const COSTON2_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0xbC1F76CEB521Eb5484b8943B5462D08ea96617A1" },
};

const SONGBIRD_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0x421c69E22f48e14Fc2d2Ee3812c59bfb81c38516" },
};

const FLARE_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0x89e50DC0380e597ecE79c8494bAAFD84537AD0D4" },
};

const CONFIG_MAP: Record<networks, NetworkContractAddresses> = {
  coston2: COSTON2_CONFIG,
  coston: COSTON_CONFIG,
  songbird: SONGBIRD_CONFIG,
  flare: FLARE_CONFIG,
};

export type networks = "coston2" | "coston" | "songbird" | "flare";

export const CHAIN_IDS: Record<networks, bigint> = {
  flare: 14n,
  songbird: 19n,
  coston: 16n,
  coston2: 114n,
};

export function expectedChainId(): bigint {
  const network = process.env.NETWORK as networks;
  const chainId = CHAIN_IDS[network];
  if (chainId === undefined) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return chainId;
}

const contracts = () => {
  const network = process.env.NETWORK as networks;
  const config = CONFIG_MAP[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
};

const COSTON_RPC = "https://coston-api.flare.network/ext/bc/C/rpc";
const COSTON2_RPC = "https://coston2-api.flare.network/ext/bc/C/rpc";
const SONGBIRD_RPC = "https://songbird-api.flare.network/ext/bc/C/rpc";
const FLARE_RPC = "https://flare-api.flare.network/ext/bc/C/rpc";

const RPC_MAP: Record<networks, string> = {
  coston2: COSTON2_RPC,
  coston: COSTON_RPC,
  songbird: SONGBIRD_RPC,
  flare: FLARE_RPC,
};

const rpc = () => {
  const network = process.env.NETWORK as networks;
  if (!network) {
    throw new Error("NETWORK env variable is not set");
  }
  if (!RPC_MAP[network]) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return process.env[`${network.toUpperCase()}_RPC`] || RPC_MAP[network];
};

export const CONTRACTS = () => contracts();
export const RPC = () => rpc();

export const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
