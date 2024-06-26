import Web3 from "web3";
import { CONTRACTS, RPC, ZERO_BYTES32 } from "../configs/networks";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config();

if (!RPC) {
    throw new Error("NETWORK env variable is not set or is set to an unsupported network.");
}

const web3 = new Web3(RPC);

const flareSystemsManagerAbi = JSON.parse(readFileSync(`abi/FlareSystemsManager.json`).toString()).abi;
const flareSystemsManager = new web3.eth.Contract(flareSystemsManagerAbi, CONTRACTS.FlareSystemsManager.address);

export async function getStatus(rewardEpochId: number) {

    const currentRewardEpochId: number = Number(await flareSystemsManager.methods.getCurrentRewardEpochId().call());
    let endRewardEpochId: number;
    let startRewardEpochId: number;

    if (isNaN(rewardEpochId)) {
        endRewardEpochId = currentRewardEpochId;
        startRewardEpochId = currentRewardEpochId - 4;
    } else {
        endRewardEpochId = currentRewardEpochId;
        startRewardEpochId = rewardEpochId;
    }



    console.log(`Reward epoch ID | Uptime vote finished | Rewards vote finished`);
    for (
        let rewardEpochId = startRewardEpochId;
        rewardEpochId <= endRewardEpochId;
        rewardEpochId++
    ) {

        const uptimeVoteHash = await flareSystemsManager.methods.uptimeVoteHash(rewardEpochId).call();
        const rewardsHash = await flareSystemsManager.methods.rewardsHash(rewardEpochId).call();

        const isUptimeHash = uptimeVoteHash && (uptimeVoteHash as any as string) !== ZERO_BYTES32;
        const isRewardsHash = rewardsHash && (rewardsHash as any as string) !== ZERO_BYTES32;

        console.log(
            `${(rewardEpochId.toString().padStart(11)).padEnd(24)} ${(isUptimeHash ? " YES " : " NO ").padEnd(24)}${(isRewardsHash ? "YES " : " NO ").padEnd(9)}`
        );
    }
}