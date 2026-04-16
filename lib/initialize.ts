import { readFileSync } from "fs";
import { type ContractAbi, Web3 } from "web3";
import { RPC } from "../configs/networks.js";

export function initializeFlareSystemsManager(web3: Web3, flareSystemsManagerAddress: string) {
  const flareSystemsManagerAbi = (
    JSON.parse(readFileSync(`abi/FlareSystemsManager.json`).toString()) as Record<string, unknown>
  ).abi as ContractAbi;
  return new web3.eth.Contract(flareSystemsManagerAbi, flareSystemsManagerAddress);
}

export function initializeWeb3(): Web3 {
  if (RPC() === undefined) {
    // should not happen due to checks in RPC()
    throw new Error("NETWORK env variable is not set or is set to an unsupported network.");
  }
  return new Web3(RPC());
}
