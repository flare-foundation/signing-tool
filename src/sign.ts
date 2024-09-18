import Web3 from "web3";
import { ECDSASignature } from "../lib/ECDSASignature";
import { IRewardDistributionData } from "../lib/interfaces";
import { ZERO_BYTES32, networks } from "../configs/networks";
import axios from 'axios';
import * as dotenv from "dotenv";
import { initializeFlareSystemsManager } from "../lib/initialize";

dotenv.config();

export async function getRewardCalculationDataPath(rewardEpochId: number) {
  const network = process.env.NETWORK as networks;
  switch (network) {
    case "coston2":
      return `https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston2/${rewardEpochId}/reward-distribution-data.json`;
    case "coston":
      return `https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston/${rewardEpochId}/reward-distribution-data.json`;
    case "songbird":
      return `https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/songbird/${rewardEpochId}/reward-distribution-data.json`;
    case "flare":
      return `https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/flare/${rewardEpochId}/reward-distribution-data.json`;
    default:
      ((_: never): void => { })(network);
  }
}

export async function getUptimeVoteHash(web3: Web3): Promise<string> {
  // fake vote hash
  return web3.utils.keccak256(ZERO_BYTES32);
}

export async function getRewardsData(rewardEpochId: number): Promise<[string, number]> {
  const path = await getRewardCalculationDataPath(rewardEpochId) as any;
  if (path === undefined) {
    throw new Error("NETWORK env variable is not set or is set to an unsupported network.");
  }
  const response = await axios.get(path);
  const data: IRewardDistributionData = response.data;
  const rewardsHash: string = data.merkleRoot;
  const noOfWeightBasedClaims: number = data.noOfWeightBasedClaims;
  return [rewardsHash, noOfWeightBasedClaims];
}

export async function signUptimeVote(web3: Web3, flareSystemsManagerAddress: string, rewardEpochId: number, fakeVoteHash: string) {

  if (!process.env.PRIVATE_KEY || !process.env.SIGNING_POLICY_PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
    );
  }
  const signingPrivateKey = process.env.SIGNING_POLICY_PRIVATE_KEY;
  const senderPrivateKey = process.env.PRIVATE_KEY;

  const flareSystemsManager = await initializeFlareSystemsManager(web3, flareSystemsManagerAddress);

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
    to: flareSystemsManagerAddress,
    data: flareSystemsManager.methods.signUptimeVote(rewardEpochId, fakeVoteHash, signature).encodeABI(),
    gas: "500000",
    gasPrice,
    nonce: Number(nonce).toString(),
  };
  const signed = await wallet.signTransaction(tx);
  try {
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    console.log(`Uptime vote for epoch ${rewardEpochId} from ${wallet.address} sent`);
  }
  catch (e: any) {
    if ("reason" in e) {
      console.error(`Failed to send uptime vote for epoch ${rewardEpochId} from ${wallet.address}: ${e.reason}`);
    } else {
      console.error(`Failed to send uptime vote for epoch ${rewardEpochId} from ${wallet.address}: ${e}`);
      console.dir(e);
    }
  }
}

export async function signRewards(web3: Web3, flareSystemsManagerAddress: string, rewardEpochId: number, rewardsHash: string, noOfWeightBasedClaims: number) {

  if (!process.env.PRIVATE_KEY || !process.env.SIGNING_POLICY_PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
    );
  }

  const signingPrivateKey = process.env.SIGNING_POLICY_PRIVATE_KEY;
  const senderPrivateKey = process.env.PRIVATE_KEY;

  const flareSystemsManager = await initializeFlareSystemsManager(web3, flareSystemsManagerAddress);

  const wallet = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
  console.log(`Sending Merkle root for epoch ${rewardEpochId} from ${wallet.address}`);

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
    to: flareSystemsManagerAddress,
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
  } catch (e: any) {
    if ("reason" in e) {
      console.error(`Failed to send Merkle root for rewards for epoch ${rewardEpochId} from ${wallet.address}: ${e.reason}`);
    } else {
      console.error(`Failed to send Merkle root for rewards for epoch ${rewardEpochId} from ${wallet.address}: ${e}`);
      console.dir(e);
    }
  }
}