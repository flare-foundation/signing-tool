import { Command } from "commander";
import { join } from "path";
import * as dotenv from "dotenv";
import { findProjectRoot } from "../lib/initialize.js";
import { cli } from "./cli.js";

dotenv.config({ path: join(findProjectRoot(import.meta.dirname), ".env"), quiet: true });

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
