import { Web3 } from "web3";
import { ZERO_BYTES32 } from "../configs/networks.js";
import { initializeFlareSystemsManager } from "../lib/initialize.js";

export async function getStatus(web3: Web3, flareSystemsManagerAddress: string, rewardEpochId: number) {
  const flareSystemsManager = initializeFlareSystemsManager(web3, flareSystemsManagerAddress);

  const currentRewardEpochId: number = Number(await flareSystemsManager.methods.getCurrentRewardEpochId!().call());

  const [startRewardEpochId, endRewardEpochId] = getEpochRange(rewardEpochId, currentRewardEpochId);

  console.log(`Reward epoch ID | Uptime vote finished | Rewards vote finished`);
  for (let epochId = startRewardEpochId; epochId <= endRewardEpochId; epochId++) {
    const uptimeVoteHash = await flareSystemsManager.methods.uptimeVoteHash!(epochId).call();
    const rewardsHash = await flareSystemsManager.methods.rewardsHash!(epochId).call();

    const isUptimeHash = uptimeVoteHash && (uptimeVoteHash as unknown as string) !== ZERO_BYTES32;
    const isRewardsHash = rewardsHash && (rewardsHash as unknown as string) !== ZERO_BYTES32;

    console.log(
      `${epochId.toString().padStart(11).padEnd(24)} ${(isUptimeHash ? " YES " : " NO ").padEnd(24)}${(isRewardsHash ? "YES " : " NO ").padEnd(9)}`
    );
  }
}

export function getEpochRange(rewardEpochId: number, currentRewardEpochId: number): [number, number] {
  let endRewardEpochId: number;
  let startRewardEpochId: number;

  if (isNaN(rewardEpochId)) {
    endRewardEpochId = currentRewardEpochId;
    startRewardEpochId = Math.max(0, currentRewardEpochId - 4);
  } else {
    endRewardEpochId = currentRewardEpochId;
    startRewardEpochId = rewardEpochId;
  }

  return [startRewardEpochId, endRewardEpochId];
}
