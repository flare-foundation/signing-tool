import chalk from 'chalk'
import inquirer from 'inquirer';

/**
 * Provides various prompts used in the CLI for user interaction.
 */
export const prompts = {
  continueUptimeVote: async (rewardEpochId: number, hash: string) => {
    const questions = [{
      type: 'list',
      name: 'continueUptimeVote',
      message: chalk.magenta(`Signing uptime vote for reward epoch: ${rewardEpochId} and Merkle root: ${hash} (default hash of zero). \nDo you want to proceed?`),
      choices: [
        "Yes",
        "No"
      ],
      filter: (val :String) => {
        return val == "Yes" ? true : false
      }
    }];
    return inquirer.prompt(questions);
  },
  continueRewards: async (rewardEpochId: number, hash: string, noOfWeightBasedClaims: number) => {
    const questions = [{
      type: 'list',
      name: 'continueRewards',
      message: chalk.magenta(`Signing rewards for reward epoch: ${rewardEpochId}, Merkle root: ${hash} and number of weight based claims: ${noOfWeightBasedClaims}. \nDo you want to proceed?`),
      choices: [
        "Yes",
        "No"
      ],
      filter: (val: string) => {
        return val == "Yes" ? true : false
      }
    }];
    return inquirer.prompt(questions);
  }
}
