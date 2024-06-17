import { Command } from 'commander'
import { cli } from './cli'

const program = new Command("Signing Tool");
cli(program).then(() => {
    program.parseAsync().catch(err => {
        if (err instanceof Error) {
            console.log(`Error: ${err.message}`);
        }
    })
})