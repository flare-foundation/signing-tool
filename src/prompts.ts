import chalk from 'chalk'
import inquirer from 'inquirer';

/**
 * Provides various prompts used in the CLI for user interaction.
 */
export const prompts = {
  continueUptimeVote: async (rewardEpochId: number) => {
    const questions = [{
      type: 'list',
      name: 'continueUptimeVote',
      message: chalk.magenta(`Do you want to sing uptime vote for reward epoch ${rewardEpochId}?`),
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
  continueRewards: async (rewardEpochId: number) => {
    const questions = [{
      type: 'list',
      name: 'continueRewards',
      message: chalk.magenta(`Do you want to sing rewards Merkle root for reward epoch ${rewardEpochId}?`),
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
