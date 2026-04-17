import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { type ContractAbi, Web3 } from "web3";
import { RPC } from "../configs/networks.js";

const MAX_PARENT_WALK = 3;

export function findProjectRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i <= MAX_PARENT_WALK; i++) {
    if (existsSync(join(dir, "abi", "FlareSystemsManager.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not find project root (looking for abi/FlareSystemsManager.json within 3 parent directories)");
}

export function initializeFlareSystemsManager(web3: Web3, flareSystemsManagerAddress: string) {
  const abiPath = join(findProjectRoot(import.meta.dirname), "abi", "FlareSystemsManager.json");
  const flareSystemsManagerAbi = (JSON.parse(readFileSync(abiPath).toString()) as Record<string, unknown>)
    .abi as ContractAbi;
  return new web3.eth.Contract(flareSystemsManagerAbi, flareSystemsManagerAddress);
}

export function initializeWeb3(): Web3 {
  if (RPC() === undefined) {
    throw new Error("NETWORK env variable is not set or is set to an unsupported network.");
  }
  return new Web3(RPC());
}
