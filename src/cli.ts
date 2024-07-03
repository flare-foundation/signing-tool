import { Command, OptionValues } from 'commander'
import { getRewardsData, getUptimeVoteHash, signRewards, signUptimeVote } from './sign'
import { prompts } from "./prompts";
import { getStatus } from './status';
import { initializeWeb3 } from '../lib/initialize';
import { CONTRACTS } from '../configs/networks';

export async function cli(program: Command) {
    program
        .command("uptime").description("Sign uptime vote")
        .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
        .action(async (options: OptionValues) => {
            let rewardEpochId = Number(options.rewardEpochId);
            if (isNaN(rewardEpochId)) {
                throw new Error("Reward epoch was not provided or is not a number.");
            }
            const web3 = await initializeWeb3();
            let uptimeVoteHash = await getUptimeVoteHash(web3);
            const shouldContinue = await prompts.continueUptimeVote(rewardEpochId, uptimeVoteHash);
            if (shouldContinue.continueUptimeVote) {
                await signUptimeVote(web3, CONTRACTS.FlareSystemsManager.address, rewardEpochId, uptimeVoteHash);
            }
        })
    program
        .command("rewards").description("Sign rewards vote")
        .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
        .action(async (options: OptionValues) => {
            let rewardEpochId = Number(options.rewardEpochId);
            if (isNaN(rewardEpochId)) {
                throw new Error("Reward epoch was not provided or is not a number.");
            }
            let [rewardsHash, noOfWeightBasedClaims] = await getRewardsData(rewardEpochId);
            const shouldContinue = await prompts.continueRewards(rewardEpochId, rewardsHash, noOfWeightBasedClaims);
            if (shouldContinue.continueRewards) {
                const web3 = await initializeWeb3();
                await signRewards(web3, CONTRACTS.FlareSystemsManager.address, rewardEpochId, rewardsHash, noOfWeightBasedClaims);
            }
        })
    program
        .command("status").description("Get uptime and rewards vote status")
        .option("-r, --first-reward-epoch-id <firstRewardEpochId>", "First reward epoch id")
        .action(async (options: OptionValues) => {
            const web3 = await initializeWeb3();
            await getStatus(web3, CONTRACTS.FlareSystemsManager.address, Number(options.firstRewardEpochId));
        })
}
