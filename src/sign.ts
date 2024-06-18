import Web3 from "web3";
import { ECDSASignature } from "../lib/ECDSASignature";
import { IRewardDistributionData } from "../lib/interfaces";
import { CONTRACTS, RPC, ZERO_BYTES32 } from "../configs/networks";
import { readFileSync } from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(RPC);
// console.log(`Connected to ${RPC}`);

const flareSystemsManagerAbi = JSON.parse(readFileSync(`abi/FlareSystemsManager.json`).toString()).abi;
const flareSystemsManager = new web3.eth.Contract(flareSystemsManagerAbi, CONTRACTS.FlareSystemsManager.address);

export async function getUptimeVoteHash(): Promise<string> {
  // fake vote hash
  return web3.utils.keccak256(ZERO_BYTES32);
}

export async function getRewardsData(rewardEpochId: number): Promise<[string, number]> {
  const response = await axios.get(`https://gitlab.com/timivesel/test/-/raw/main/calculations/${rewardEpochId}/reward-distribution-data.json`);
  const data: IRewardDistributionData = response.data;
  const rewardsHash: string = data.merkleRoot;
  const noOfWeightBasedClaims: number = data.noOfWeightBasedClaims;
  return [rewardsHash, noOfWeightBasedClaims];
}

export async function signUptimeVote(rewardEpochId: number, fakeVoteHash: string) {

    if (!process.env.PRIVATE_KEY || !process.env.SIGNING_POLICY_PRIVATE_KEY) {
        throw new Error(
          "PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
        );
    }
    const signingPrivateKey = process.env.SIGNING_POLICY_PRIVATE_KEY;
    const senderPrivateKey = process.env.PRIVATE_KEY;

    const wallet = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
    console.log(`Sending uptime vote for epoch ${rewardEpochId} from ${wallet.address}`);

    const message = "0x" + rewardEpochId.toString(16).padStart(64, "0") + fakeVoteHash.slice(2);
    const messageHash = web3.utils.keccak256(message);
    const signature = await ECDSASignature.signMessageHash(messageHash, signingPrivateKey);
    let gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(wallet.address);
    gasPrice = (gasPrice * 120n) / 100n; // bump gas price by 20%
    const tx = {
      from: wallet.address,
      to: CONTRACTS.FlareSystemsManager.address,
      data: flareSystemsManager.methods.signUptimeVote(rewardEpochId, fakeVoteHash, signature).encodeABI(),
      value: "0",
      gas: "500000",
      gasPrice,
      nonce: Number(nonce).toString(),
    };
    const signed = await wallet.signTransaction(tx);
    try {
      const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
      console.log(`Uptime vote for epoch ${rewardEpochId} from ${wallet.address} sent`);
    }
    catch (e) {
      console.error(`Failed to send uptime vote for epoch ${rewardEpochId} from ${wallet.address}: ${e}`);
      console.dir(e);
    }
}

export async function signRewards(rewardEpochId: number, rewardsHash: string, noOfWeightBasedClaims: number) {
    if (!process.env.PRIVATE_KEY || !process.env.SIGNING_POLICY_PRIVATE_KEY) {
        throw new Error(
          "PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
        );
    }
    const signingPrivateKey = process.env.SIGNING_POLICY_PRIVATE_KEY;
    const senderPrivateKey = process.env.PRIVATE_KEY;

    const wallet = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
    console.log(`Sending merkle root for epoch ${rewardEpochId} from ${wallet.address}`);

    const rewardManagerId = await web3.eth.getChainId();
    const noOfWeightBasedClaimsAndId = [[rewardManagerId, noOfWeightBasedClaims]];
    const noOfWeightBasedClaimsEncoded = web3.eth.abi.encodeParameters(
      ["tuple(uint256,uint256)[]"],
      [noOfWeightBasedClaimsAndId]
    );

    const noOfWeightBasedClaimsHash = web3.utils.keccak256(noOfWeightBasedClaimsEncoded);
    const message =
      "0x" +
      rewardEpochId.toString(16).padStart(64, "0") +
      noOfWeightBasedClaimsHash.slice(2) +
      rewardsHash.slice(2);
    const messageHash = web3.utils.keccak256(message);
    const signature = await ECDSASignature.signMessageHash(messageHash, signingPrivateKey);
    let gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(wallet.address);
    gasPrice = (gasPrice * 120n) / 100n; // bump gas price by 20%
    const tx = {
      from: wallet.address,
      to: CONTRACTS.FlareSystemsManager.address,
      data: flareSystemsManager.methods
        .signRewards(rewardEpochId, noOfWeightBasedClaimsAndId, rewardsHash, signature)
        .encodeABI(),
      gas: "500000",
      gasPrice,
      nonce: Number(nonce).toString(),
    };
    const signed = await wallet.signTransaction(tx);
    try {
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        console.log(`Merkle root for rewards for epoch ${rewardEpochId} from ${wallet.address} sent`);
    } catch (e) {
        console.error(`Failed to send merkle root for rewards for epoch ${rewardEpochId} from ${wallet.address}: ${e}`);
        console.dir(e);
    }
  }

// sendUptimeVote(2775);
// signRewards(2772);