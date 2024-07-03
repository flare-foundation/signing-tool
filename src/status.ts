import Web3 from "web3";
import { ZERO_BYTES32 } from "../configs/networks";
import * as dotenv from "dotenv";
import { initializeFlareSystemsManager } from "../lib/initialize";

dotenv.config();

export async function getStatus(web3: Web3, flareSystemsManagerAddress: string, rewardEpochId: number) {

    const flareSystemsManager = await initializeFlareSystemsManager(web3, flareSystemsManagerAddress);

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