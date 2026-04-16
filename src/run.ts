import { Command } from "commander";
import { cli } from "./cli.js";

const program = new Command("Signing Tool");
cli(program);
program.parseAsync().catch((err) => {
  if (err instanceof Error) {
    console.log(`Error: ${err.message}`);
  }
});
