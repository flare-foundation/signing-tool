import { Command, OptionValues } from 'commander'
import { getRewardsData, getUptimeVoteHash, signRewards, signUptimeVote } from './sign'
import { prompts } from "./prompts";
import { getStatus } from './status';

export async function cli(program: Command) {
    program
        .command("uptime").description("Sign uptime vote")
        .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
        .action(async (options: OptionValues) => {
            let rewardEpochId = Number(options.rewardEpochId);
            if (isNaN(rewardEpochId)) {
                throw new Error("Reward epoch was not provided or is not a number.");
            }
            let uptimeVoteHash = await getUptimeVoteHash();
            const shouldContinue = await prompts.continueUptimeVote(rewardEpochId, uptimeVoteHash);
            if (shouldContinue.continueUptimeVote) {
                await signUptimeVote(rewardEpochId, uptimeVoteHash);
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
                await signRewards(rewardEpochId, rewardsHash, noOfWeightBasedClaims);
            }
        })
    program
        .command("status").description("Get uptime and rewards vote status")
        .option("-r, --first-reward-epoch-id <firstRewardEpochId>", "First reward epoch id")
        .action(async (options: OptionValues) => {
            await getStatus(Number(options.firstRewardEpochId));
        })
}
