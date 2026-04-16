import { Command } from "commander";
import { cli } from "./cli.js";

const program = new Command("Signing Tool");
cli(program);
program.parseAsync().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(`Error: ${err.message}`);
  } else {
    console.error(`Error: ${String(err)}`);
  }
  process.exitCode = 1;
});
