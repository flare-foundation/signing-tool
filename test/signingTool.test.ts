import { getTestFile } from "./utils";
import { initializeWeb3 } from "../lib/initialize";
import { expect } from "chai";
import { getRewardCalculationDataPath, getRewardsData, getUptimeVoteHash, signRewards, signUptimeVote } from "../src/sign";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../configs/networks";
import { FlareSystemsManagerMockContract, FlareSystemsManagerMockInstance } from '../typechain-truffle';
import { ECDSASignature } from "../lib/ECDSASignature";

let fs = require('fs');

const FlareSystemsManagerMock: FlareSystemsManagerMockContract = artifacts.require("FlareSystemsManagerMock");

contract(`Signing tool test; ${getTestFile(__filename)}`, async accounts => {

    before(async () => {
        process.env.NETWORK = "coston";
    });

    let fsmMock: FlareSystemsManagerMockInstance;

    describe("Initialize Web3", async () => {
        it("Should initialize RPC", async () => {
            process.env.NETWORK = "coston";
            await initializeWeb3();
        });
        it("Should revert initializing web3 if network env variable is not set", async () => {
            process.env.NETWORK = "x";
            await expect(initializeWeb3()).to.be.revertedWith('NETWORK env variable is not set or is set to an unsupported network.');
        });
    });

    describe("Sign uptime vote", async () => {
        it("Should get uptime vote hash", async () => {
            expect(await getUptimeVoteHash(web3)).to.eq(web3.utils.keccak256(ZERO_BYTES32));
        });

        it("Should revert signing uptime vote if PRIVATE_KEY or SIGNING_POLICY_PRIVATE_KEY env variable is not set", async () => {
            process.env.PRIVATE_KEY = "";
            process.env.SIGNING_POLICY_PRIVATE_KEY = "";
            await expect(signUptimeVote(web3, ZERO_ADDRESS, 0, ZERO_BYTES32)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal("Error: PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required.");
            });
        });

        it("Should sign uptime vote", async () => {
            const privateKeys = JSON.parse(fs.readFileSync('test/test-1020-accounts.json'))
            process.env.PRIVATE_KEY = privateKeys[0].privateKey;
            process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

            fsmMock = await FlareSystemsManagerMock.new();
            let signedHash = await fsmMock.uptimeVoteHash(0, accounts[1]);
            expect(signedHash).to.eq(ZERO_BYTES32);

            let uptimeVoteHash = await getUptimeVoteHash(web3);
            await signUptimeVote(web3, fsmMock.address, 0, uptimeVoteHash);
            signedHash = await fsmMock.uptimeVoteHash(0, accounts[1]);
            expect(signedHash).to.eq(uptimeVoteHash);
        });

        it("Should not sign uptime vote", async () => {
            const privateKeys = JSON.parse(fs.readFileSync('test/test-1020-accounts.json'))
            process.env.PRIVATE_KEY = privateKeys[0].privateKey;
            process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

            fsmMock = await FlareSystemsManagerMock.new();

            let uptimeVoteHash = await getUptimeVoteHash(web3);
            await signUptimeVote(web3, fsmMock.address, 0, uptimeVoteHash);

            // vote again
            await signUptimeVote(web3, fsmMock.address, 0, uptimeVoteHash);
        });
    });

    describe("Rewards calculation data path", async () => {
        it("Should get rewards calculation data path for coston", async () => {
            process.env.NETWORK = "coston";
            expect(await getRewardCalculationDataPath(0)).to.eq("https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston/0/reward-distribution-data.json");
        });

        it("Should get rewards calculation data path for coston2", async () => {
            process.env.NETWORK = "coston2";
            expect(await getRewardCalculationDataPath(1)).to.eq("https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston2/1/reward-distribution-data.json");
        });

        it("Should get rewards calculation data path for songbird", async () => {
            process.env.NETWORK = "songbird";
            expect(await getRewardCalculationDataPath(12)).to.eq("https://raw.githubusercontent.com/flare-foundation/FTSO-scaling/main/rewards-data/songbird/12/reward-distribution-data.json");
        });

        it("Should get rewards calculation data path for flare", async () => {
            process.env.NETWORK = "flare";
            expect(await getRewardCalculationDataPath(90)).to.eq("https://raw.githubusercontent.com/flare-foundation/FTSO-scaling/main/rewards-data/flare/90/reward-distribution-data.json");
        });

        it("Should return undefined if NETWORK env variable is set to unsupported network", async () => {
            process.env.NETWORK = "network123";
            expect(await getRewardCalculationDataPath(0)).to.eq(undefined);
        });
    });

    describe("Get rewards data", async () => {
        it("Should revert getting rewards data if NETWORK env variable is not set", async () => {
            process.env.NETWORK = undefined;
            await expect(getRewardsData(23)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal("Error: NETWORK env variable is not set or is set to an unsupported network.");
            });
        });

        it("Should get rewards data for songbird", async () => {
            process.env.NETWORK = "songbird";
            const [rewardsHash, noOfWeightBasedClaims] = await getRewardsData(196);
            expect(rewardsHash).to.eq("0x83f0f2c5e35259ebf80100273f5fd0bcf2e6109180b8efcf2d7ce5d5dfbe1f20");
            expect(noOfWeightBasedClaims).to.eq(34);
        });
    });

    describe("Sign rewards", async () => {
        it("Should revert signing rewards if PRIVATE_KEY or SIGNING_POLICY_PRIVATE_KEY env variable is not set", async () => {
            process.env.PRIVATE_KEY = "";
            await expect(signRewards(web3, ZERO_ADDRESS, 0, ZERO_BYTES32, 1)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal("Error: PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required.");
            });
        });

        it("Should sign rewards", async () => {
            const privateKeys = JSON.parse(fs.readFileSync('test/test-1020-accounts.json'))
            process.env.PRIVATE_KEY = privateKeys[0].privateKey;
            process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

            fsmMock = await FlareSystemsManagerMock.new();
            let signedHash = await fsmMock.rewardsHash(3, accounts[1]);
            expect(signedHash).to.eq(ZERO_BYTES32);

            let rewardsHash = web3.utils.keccak256("rewards hash");
            await signRewards(web3, fsmMock.address, 3, rewardsHash, 56);
            signedHash = await fsmMock.rewardsHash(3, accounts[1]);
            expect(signedHash).to.eq(rewardsHash);
        });

        it("Should not sign rewards", async () => {
            const privateKeys = JSON.parse(fs.readFileSync('test/test-1020-accounts.json'))
            process.env.PRIVATE_KEY = privateKeys[0].privateKey;
            process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

            fsmMock = await FlareSystemsManagerMock.new();

            let rewardsHash = web3.utils.keccak256("rewards hash");
            await signRewards(web3, fsmMock.address, 3, rewardsHash, 56);

            // vote again
            await signRewards(web3, fsmMock.address, 3, rewardsHash, 56);
        });
    });

    describe("ECDSA Signature", async () => {
        it("Should revert if private key does not have prefix", async () => {
            const messageHash = "0x" + "a".repeat(64);
            const privateKey = "a".repeat(64);
            await expect(ECDSASignature.signMessageHash(messageHash, privateKey)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal("Error: Invalid private key format");
            });
        });

        it("Should revert if private key length is not correct", async () => {
            const messageHash = "0x" + "a".repeat(64);
            const privateKey = "0x" + "a".repeat(63);
            await expect(ECDSASignature.signMessageHash(messageHash, privateKey)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal("Error: Invalid private key format");
            });
        });

        it("Should revert if message hash is not correct", async () => {
            const messageHash = "a".repeat(64);
            const privateKey = "0x" + "a".repeat(64);
            await expect(ECDSASignature.signMessageHash(messageHash, privateKey)).to.be.rejectedWith(Error).then(e => {
                expect(e.toString()).to.be.equal(`Error: Invalid message hash format: ${messageHash}`);
            });
        });
    });
});