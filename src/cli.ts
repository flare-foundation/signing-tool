import { Command, type OptionValues } from "commander";
import { getRewardsData, getUptimeVoteHash, signRewards, signUptimeVote } from "./sign.js";
import { prompts } from "./prompts.js";
import { getStatus } from "./status.js";
import { initializeWeb3 } from "../lib/initialize.js";
import { CONTRACTS } from "../configs/networks.js";
import { parseRewardEpochId, parseOptionalEpochId } from "./utils.js";

export function cli(program: Command) {
  program
    .command("uptime")
    .description("Sign uptime vote")
    .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
    .action(async (options: OptionValues) => {
      const rewardEpochId = parseRewardEpochId(options.rewardEpochId);
      const web3 = initializeWeb3();
      const uptimeVoteHash = getUptimeVoteHash(web3);
      const shouldContinue = (await prompts.continueUptimeVote(rewardEpochId, uptimeVoteHash)) as {
        continueUptimeVote: boolean;
      };
      if (shouldContinue.continueUptimeVote) {
        await signUptimeVote(web3, CONTRACTS().FlareSystemsManager.address, rewardEpochId, uptimeVoteHash);
      }
    });
  program
    .command("rewards")
    .description("Sign rewards vote")
    .option("-r, --reward-epoch-id <rewardEpochId>", "Reward epoch id")
    .action(async (options: OptionValues) => {
      const rewardEpochId = parseRewardEpochId(options.rewardEpochId);
      const [rewardsHash, noOfWeightBasedClaims] = await getRewardsData(rewardEpochId);
      const shouldContinue = (await prompts.continueRewards(rewardEpochId, rewardsHash, noOfWeightBasedClaims)) as {
        continueRewards: boolean;
      };
      if (shouldContinue.continueRewards) {
        const web3 = initializeWeb3();
        await signRewards(
          web3,
          CONTRACTS().FlareSystemsManager.address,
          rewardEpochId,
          rewardsHash,
          noOfWeightBasedClaims
        );
      }
    });
  program
    .command("status")
    .description("Get uptime and rewards vote status")
    .option("-r, --first-reward-epoch-id <firstRewardEpochId>", "First reward epoch id")
    .action(async (options: OptionValues) => {
      const firstEpochId = parseOptionalEpochId(options.firstRewardEpochId);
      const web3 = initializeWeb3();
      await getStatus(web3, CONTRACTS().FlareSystemsManager.address, firstEpochId);
    });
}
