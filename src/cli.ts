import { Command, OptionValues } from 'commander'
import { getRewardsData, getUptimeVoteHash, signRewards, signUptimeVote } from './sign'
import { prompts } from "./prompts";

export async function cli(program: Command) {
    program
        .command("uptime").description("...")
        .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
        .action(async (options: OptionValues) => {
            let rewardEpochId = Number(options.rewardEpochId);
            let uptimeVoteHash = await getUptimeVoteHash();
            const shouldContinue = await prompts.continueUptimeVote(rewardEpochId, uptimeVoteHash);
            if (shouldContinue.continueUptimeVote) {
                await signUptimeVote(rewardEpochId);
            }
        })
    program
        .command("rewards").description("...")
        .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
        .action(async (options: OptionValues) => {
            let rewardEpochId = Number(options.rewardEpochId);
            let [rewardsHash, noOfWeightBasedClaims] = await getRewardsData(rewardEpochId);
            const shouldContinue = await prompts.continueRewards(rewardEpochId, rewardsHash, noOfWeightBasedClaims);
            if (shouldContinue.continueRewards) {
                await signRewards(rewardEpochId);
            }
        })
}
