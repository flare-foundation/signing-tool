import { NetworkContractAddresses } from "./contracts";
import * as dotenv from "dotenv";

dotenv.config();

const COSTON_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0x85680Dd93755Fe5d0789773fd0896cEE51F9e358" },
  FtsoRewardOffersManager: { name: "FtsoRewardOffersManager", address: "0xC9534cB913150aD3e98D792857689B55e2404212" },
  RewardManager: { name: "RewardManager", address: "0xA17197b7Bdff7Be7c3Da39ec08981FB716B70d3A" },
  Submission: { name: "Submission", address: "0x2cA6571Daa15ce734Bbd0Bf27D5C9D16787fc33f" },
  Relay: { name: "Relay", address: "0x32D46A1260BB2D8C9d5Ab1C9bBd7FF7D7CfaabCC" },
  FlareSystemsCalculator: { name: "FlareSystemsCalculator", address: "0x43CBAB9C953F54533aadAf7ffCD13c30ec05Edc9" },
  VoterRegistry: { name: "VoterRegistry", address: "0xE2c06DF29d175Aa0EcfcD10134eB96f8C94448A3" },
  FtsoMerkleStructs: { name: "FtsoMerkleStructs", address: "" },
  ProtocolMerkleStructs: { name: "ProtocolMerkleStructs", address: "" },
  FastUpdater: { name: "FastUpdater", address: "0x9B931f5d3e24fc8C9064DB35bDc8FB4bE0E862f9" },
  FastUpdateIncentiveManager: {
    name: "FastUpdateIncentiveManager",
    address: "0xc1a22A1d295e829Caf3be61bd1E11E5eEd7f0F15",
  },
};

const COSTON2_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0xbC1F76CEB521Eb5484b8943B5462D08ea96617A1" },
  FtsoRewardOffersManager: { name: "FtsoRewardOffersManager", address: "0xd7107a7Ddb6ff24ff76ecFF2E06b9c4a3D8DCb88" },
  RewardManager: { name: "RewardManager", address: "0x2F10597B3c9Fd42031cb18818eF2Ab88b18Ceff8" },
  Submission: { name: "Submission", address: "0x2cA6571Daa15ce734Bbd0Bf27D5C9D16787fc33f" },
  Relay: { name: "Relay", address: "0x5CdF9eAF3EB8b44fB696984a1420B56A7575D250" },
  FlareSystemsCalculator: { name: "FlareSystemsCalculator", address: "0x9D7207b1410De031523356882637dd01F460E958" },
  VoterRegistry: { name: "VoterRegistry", address: "0x3BFdbe79BEf39Bae3F85636f525AcD3051Df4f64" },
  FtsoMerkleStructs: { name: "FtsoMerkleStructs", address: "" },
  ProtocolMerkleStructs: { name: "ProtocolMerkleStructs", address: "" },
  FastUpdater: { name: "FastUpdater", address: "" },
  FastUpdateIncentiveManager: { name: "FastUpdateIncentiveManager", address: "" },
};

const SONGBIRD_CONFIG: NetworkContractAddresses = {
  FlareSystemsManager: { name: "FlareSystemsManager", address: "0x421c69E22f48e14Fc2d2Ee3812c59bfb81c38516" },
  FtsoRewardOffersManager: { name: "FtsoRewardOffersManager", address: "0x5aB9cB258a342001C4663D9526A1c54cCcF8C545" },
  RewardManager: { name: "RewardManager", address: "0x8A80583BD5A5Cd8f68De585163259D61Ea8dc904" },
  Submission: { name: "Submission", address: "0x2cA6571Daa15ce734Bbd0Bf27D5C9D16787fc33f" },
  Relay: { name: "Relay", address: "0xbA35e39D01A3f5710d1e43FC61dbb738B68641c4" },
  FlareSystemsCalculator: { name: "FlareSystemsCalculator", address: "0x126FAeEc75601dA3354c0b5Cc0b60C85fCbC3A5e" },
  VoterRegistry: { name: "VoterRegistry", address: "0x31B9EC65C731c7D973a33Ef3FC83B653f540dC8D" },
  FtsoMerkleStructs: { name: "FtsoMerkleStructs", address: "" },
  ProtocolMerkleStructs: { name: "ProtocolMerkleStructs", address: "" },
  FastUpdater: { name: "FastUpdater", address: "" },
  FastUpdateIncentiveManager: { name: "FastUpdateIncentiveManager", address: "" },
};

const COSTON_RPC = "https://coston-api.flare.network/ext/bc/C/rpc";
const COSTON2_RPC = "https://coston2-api.flare.network/ext/bc/C/rpc";
const SONGBIRD_RPC = "https://songbird-api.flare.network/ext/bc/C/rpc";
const FLARE_RPC = "https://flare-api.flare.network/ext/bc/C/rpc";

export type networks = "coston2" | "coston" | "songbird";

const contracts = () => {
const network = process.env.NETWORK as networks;
  switch (network) {
    case "coston2":
      return COSTON2_CONFIG;
    case "coston":
      return COSTON_CONFIG;
    case "songbird":
      return SONGBIRD_CONFIG;
    default:
      return COSTON_CONFIG;
  }
};

const rpc = () => {
  const network = process.env.NETWORK as networks;
    switch (network) {
      case "coston2":
        return process.env.COSTON2_RPC || COSTON2_RPC;
      case "coston":
        return process.env.COSTON_RPC || COSTON_RPC;
      case "songbird":
        return process.env.SONGBIRD_RPC || SONGBIRD_RPC;
      default:
        ((_: never): void => {})(network);
      }
  };


export const CONTRACTS = contracts();
export const RPC = rpc();

export const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
