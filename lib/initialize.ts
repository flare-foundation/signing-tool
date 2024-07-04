import { readFileSync } from "fs";
import Web3 from "web3";
import { RPC } from "../configs/networks";

export async function initializeFlareSystemsManager(web3: Web3, flareSystemsManagerAddress: string) {
    const flareSystemsManagerAbi = JSON.parse(readFileSync(`abi/FlareSystemsManager.json`).toString()).abi;
    return new web3.eth.Contract(flareSystemsManagerAbi, flareSystemsManagerAddress);
}

export async function initializeWeb3() {
    if (RPC() === undefined) {
        throw new Error("NETWORK env variable is not set or is set to an unsupported network.");
    }
    return new Web3(RPC());
}