import { getTestFile } from "./utils.js";
import { initializeWeb3 } from "../lib/initialize.js";
import { expect } from "chai";
import {
  getRewardCalculationDataPath,
  getRewardsData,
  getUptimeVoteHash,
  signRewards,
  signUptimeVote,
} from "../src/sign.js";
import { parseRewardEpochId, parseOptionalEpochId, parseGasPriceMultiplier, round, MAX_UINT24 } from "../src/utils.js";
import { CONTRACTS, RPC, ZERO_ADDRESS, ZERO_BYTES32 } from "../configs/networks.js";
import { ECDSASignature } from "../lib/ECDSASignature.js";
import { getEpochRange, getStatus } from "../src/status.js";
import { EventEmitter } from "events";
import fs from "fs";
import axios from "axios";
import hre from "hardhat";
import { Web3 } from "web3";
import type { BaseContract, BigNumberish } from "ethers";

interface FlareSystemsManagerMock extends BaseContract {
  voterUptimeVoteHash(rewardEpochId: BigNumberish, voter: string): Promise<string>;
  voterRewardsHash(rewardEpochId: BigNumberish, voter: string): Promise<string>;
  uptimeVoteHash(rewardEpochId: BigNumberish): Promise<string>;
  rewardsHash(rewardEpochId: BigNumberish): Promise<string>;
  setCurrentRewardEpochId(rewardEpochId: BigNumberish): Promise<unknown>;
  getCurrentRewardEpochId(): Promise<bigint>;
  setHashes(rewardEpochId: BigNumberish, uptimeVoteHash: string, rewardsHash: string): Promise<unknown>;
}
// increase max listeners to prevent warning
EventEmitter.defaultMaxListeners = 20;

//// Before running these tests comment local .env file
describe(`Signing tool test; ${getTestFile(import.meta.filename)}`, () => {
  let fsmMock: FlareSystemsManagerMock;
  let accounts: string[];
  let web3: Web3;
  let ethers: Awaited<ReturnType<typeof hre.network.connect>>["ethers"];

  before(async () => {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
    web3 = new Web3(connection.provider as any);
    // Stub getChainId so the signing chain ID check accepts the Hardhat EDR network as "coston" (16)
    web3.eth.getChainId = async () => 16n;
  });

  beforeEach(async () => {
    process.env.NETWORK = "coston";
    const signers = await ethers.getSigners();
    accounts = signers.map((s) => s.address);
    const factory = await ethers.getContractFactory("FlareSystemsManagerMock");
    fsmMock = (await factory.deploy()) as unknown as FlareSystemsManagerMock;
  });

  describe("Initialize Web3", () => {
    it("Should initialize RPC", async () => {
      process.env.NETWORK = "coston";
      initializeWeb3();
    });

    it("Should revert initializing web3 if network env variable is not set", () => {
      process.env.NETWORK = "";
      expect(() => initializeWeb3()).to.throw("NETWORK env variable is not set");
    });

    it("Should revert initializing web3 if network env variable is set to unsupported network", () => {
      process.env.NETWORK = "x";
      expect(() => initializeWeb3()).to.throw("Unsupported network: x");
    });
  });

  describe("Sign uptime vote", () => {
    it("Should get uptime vote hash", async () => {
      expect(getUptimeVoteHash(web3)).to.eq(web3.utils.keccak256(ZERO_BYTES32));
    });

    it("Should revert signing uptime vote if PRIVATE_KEY or SIGNING_POLICY_PRIVATE_KEY env variable is not set", async () => {
      process.env.PRIVATE_KEY = "";
      process.env.SIGNING_POLICY_PRIVATE_KEY = "";
      await expect(signUptimeVote(web3, ZERO_ADDRESS, 0, ZERO_BYTES32))
        .to.be.rejectedWith(Error)
        .then((e) => {
          expect(e.toString()).to.be.equal(
            "Error: PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
          );
        });
    });

    it("Should sign uptime vote", async () => {
      const privateKeys = JSON.parse(fs.readFileSync("test/test-1020-accounts.json", "utf-8"));
      process.env.PRIVATE_KEY = privateKeys[0].privateKey;
      process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

      const mockAddress = await fsmMock.getAddress();
      let signedHash = await fsmMock.voterUptimeVoteHash(0, accounts[1]);
      expect(signedHash).to.eq(ZERO_BYTES32);

      const uptimeVoteHash = getUptimeVoteHash(web3);
      await signUptimeVote(web3, mockAddress, 0, uptimeVoteHash);
      signedHash = await fsmMock.voterUptimeVoteHash(0, accounts[1]);
      expect(signedHash).to.eq(uptimeVoteHash);
    });

    it("Should reject signing when RPC chain ID does not match NETWORK", async () => {
      const privateKeys = JSON.parse(fs.readFileSync("test/test-1020-accounts.json", "utf-8"));
      process.env.PRIVATE_KEY = privateKeys[0].privateKey;
      process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;
      process.env.NETWORK = "flare"; // expects chain ID 14, but stubbed to return 16
      const mockAddress = await fsmMock.getAddress();
      const uptimeVoteHash = getUptimeVoteHash(web3);
      await expect(signUptimeVote(web3, mockAddress, 0, uptimeVoteHash)).to.be.rejectedWith("Chain ID mismatch");
    });

    it("Should not sign uptime vote", async () => {
      const privateKeys = JSON.parse(fs.readFileSync("test/test-1020-accounts.json", "utf-8"));
      process.env.PRIVATE_KEY = privateKeys[0].privateKey;
      process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

      const mockAddress = await fsmMock.getAddress();
      const uptimeVoteHash = getUptimeVoteHash(web3);
      await signUptimeVote(web3, mockAddress, 0, uptimeVoteHash);

      // vote again — should throw because already signed
      await expect(signUptimeVote(web3, mockAddress, 0, uptimeVoteHash)).to.be.rejected;
    });
  });

  describe("Rewards calculation data path", () => {
    it("Should get rewards calculation data path for coston", async () => {
      process.env.NETWORK = "coston";
      expect(getRewardCalculationDataPath(0)).to.eq(
        "https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston/0/reward-distribution-data.json"
      );
    });

    it("Should get rewards calculation data path for coston2", async () => {
      process.env.NETWORK = "coston2";
      expect(getRewardCalculationDataPath(1)).to.eq(
        "https://gitlab.com/timivesel/ftsov2-testnet-rewards/-/raw/main/rewards-data/coston2/1/reward-distribution-data.json"
      );
    });

    it("Should get rewards calculation data path for songbird", async () => {
      process.env.NETWORK = "songbird";
      expect(getRewardCalculationDataPath(12)).to.eq(
        "https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/songbird/12/reward-distribution-data.json"
      );
    });

    it("Should get rewards calculation data path for flare", async () => {
      process.env.NETWORK = "flare";
      expect(getRewardCalculationDataPath(90)).to.eq(
        "https://raw.githubusercontent.com/flare-foundation/fsp-rewards/refs/heads/main/flare/90/reward-distribution-data.json"
      );
    });

    it("Should return undefined if NETWORK env variable is set to unsupported network", async () => {
      process.env.NETWORK = "network123";
      expect(getRewardCalculationDataPath(0)).to.eq(undefined);
    });
  });

  describe("Get rewards data", () => {
    it("Should revert getting rewards data if NETWORK env variable is not set", async () => {
      process.env.NETWORK = undefined;
      await expect(getRewardsData(23))
        .to.be.rejectedWith(Error)
        .then((e) => {
          expect(e.toString()).to.be.equal(
            "Error: NETWORK env variable is not set or is set to an unsupported network."
          );
        });
    });

    it("Should get rewards data for songbird", async () => {
      process.env.NETWORK = "songbird";
      const [rewardsHash, noOfWeightBasedClaims] = await getRewardsData(196);
      expect(rewardsHash).to.eq("0x83f0f2c5e35259ebf80100273f5fd0bcf2e6109180b8efcf2d7ce5d5dfbe1f20");
      expect(noOfWeightBasedClaims).to.eq(34);
    });

    describe("Reward data validation", () => {
      let originalGet: typeof axios.get;

      beforeEach(() => {
        process.env.NETWORK = "songbird";
        // eslint-disable-next-line @typescript-eslint/unbound-method
        originalGet = axios.get;
      });

      afterEach(() => {
        axios.get = originalGet;
      });

      it("Should revert if merkleRoot is missing", async () => {
        axios.get = (() =>
          Promise.resolve({ data: { rewardEpochId: 1, noOfWeightBasedClaims: 5 } })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Invalid or missing merkleRoot");
      });

      it("Should revert if merkleRoot is not a valid hex string", async () => {
        axios.get = (() =>
          Promise.resolve({
            data: { rewardEpochId: 1, noOfWeightBasedClaims: 5, merkleRoot: "not-hex" },
          })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Invalid or missing merkleRoot");
      });

      it("Should revert if noOfWeightBasedClaims is missing", async () => {
        axios.get = (() =>
          Promise.resolve({ data: { rewardEpochId: 1, merkleRoot: "0x" + "ab".repeat(32) } })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Invalid or missing noOfWeightBasedClaims");
      });

      it("Should revert if noOfWeightBasedClaims is negative", async () => {
        axios.get = (() =>
          Promise.resolve({
            data: { rewardEpochId: 1, merkleRoot: "0x" + "ab".repeat(32), noOfWeightBasedClaims: -1 },
          })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Invalid or missing noOfWeightBasedClaims");
      });

      it("Should revert if noOfWeightBasedClaims is not an integer", async () => {
        axios.get = (() =>
          Promise.resolve({
            data: { rewardEpochId: 1, merkleRoot: "0x" + "ab".repeat(32), noOfWeightBasedClaims: 5.5 },
          })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Invalid or missing noOfWeightBasedClaims");
      });

      it("Should revert if rewardEpochId does not match requested epoch", async () => {
        axios.get = (() =>
          Promise.resolve({
            data: { rewardEpochId: 999, merkleRoot: "0x" + "ab".repeat(32), noOfWeightBasedClaims: 5 },
          })) as typeof axios.get;
        await expect(getRewardsData(1)).to.be.rejectedWith("Reward epoch ID mismatch");
      });
    });
  });

  describe("Sign rewards", () => {
    it("Should revert signing rewards if PRIVATE_KEY or SIGNING_POLICY_PRIVATE_KEY env variable is not set", async () => {
      process.env.PRIVATE_KEY = "";
      await expect(signRewards(web3, ZERO_ADDRESS, 0, ZERO_BYTES32, 1))
        .to.be.rejectedWith(Error)
        .then((e) => {
          expect(e.toString()).to.be.equal(
            "Error: PRIVATE_KEY and SIGNING_POLICY_PRIVATE_KEY env variables are required."
          );
        });
    });

    it("Should sign rewards", async () => {
      const privateKeys = JSON.parse(fs.readFileSync("test/test-1020-accounts.json", "utf8"));
      process.env.PRIVATE_KEY = privateKeys[0].privateKey;
      process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

      const mockAddress = await fsmMock.getAddress();
      let signedHash = await fsmMock.voterRewardsHash(3, accounts[1]);
      expect(signedHash).to.eq(ZERO_BYTES32);

      const rewardsHash = web3.utils.keccak256("rewards hash");
      await signRewards(web3, mockAddress, 3, rewardsHash, 56);
      signedHash = await fsmMock.voterRewardsHash(3, accounts[1]);
      expect(signedHash).to.eq(rewardsHash);
    });

    it("Should not sign rewards", async () => {
      const privateKeys = JSON.parse(fs.readFileSync("test/test-1020-accounts.json", "utf8"));
      process.env.PRIVATE_KEY = privateKeys[0].privateKey;
      process.env.SIGNING_POLICY_PRIVATE_KEY = privateKeys[1].privateKey;

      const mockAddress = await fsmMock.getAddress();
      const rewardsHash = web3.utils.keccak256("rewards hash");
      await signRewards(web3, mockAddress, 3, rewardsHash, 56);

      // vote again — should throw because already signed
      await expect(signRewards(web3, mockAddress, 3, rewardsHash, 56)).to.be.rejected;
    });
  });

  describe("Reward epoch ID validation", () => {
    it("Should accept valid epoch ID", () => {
      expect(parseRewardEpochId("100")).to.eq(100);
      expect(parseRewardEpochId("0")).to.eq(0);
      expect(parseRewardEpochId(String(MAX_UINT24))).to.eq(MAX_UINT24);
    });

    it("Should reject negative values", () => {
      expect(() => parseRewardEpochId("-1")).to.throw("Invalid reward epoch ID");
    });

    it("Should reject float values", () => {
      expect(() => parseRewardEpochId("5.5")).to.throw("Invalid reward epoch ID");
    });

    it("Should reject values above uint24 max", () => {
      expect(() => parseRewardEpochId(String(MAX_UINT24 + 1))).to.throw("Invalid reward epoch ID");
    });

    it("Should reject non-numeric values", () => {
      expect(() => parseRewardEpochId("abc")).to.throw("Invalid reward epoch ID");
    });

    it("Should reject undefined", () => {
      expect(() => parseRewardEpochId(undefined)).to.throw("Invalid reward epoch ID");
    });
  });

  describe("Optional epoch ID validation (status command)", () => {
    it("Should return NaN when undefined (flag omitted)", () => {
      expect(parseOptionalEpochId(undefined)).to.be.NaN;
    });

    it("Should accept valid epoch ID", () => {
      expect(parseOptionalEpochId("100")).to.eq(100);
    });

    it("Should reject negative values", () => {
      expect(() => parseOptionalEpochId("-1")).to.throw("Invalid first reward epoch ID");
    });

    it("Should reject non-numeric values", () => {
      expect(() => parseOptionalEpochId("abc")).to.throw("Invalid first reward epoch ID");
    });

    it("Should reject float values", () => {
      expect(() => parseOptionalEpochId("5.5")).to.throw("Invalid first reward epoch ID");
    });
  });

  describe("Gas price multiplier validation", () => {
    it("Should return default 10 when undefined", () => {
      expect(parseGasPriceMultiplier(undefined)).to.eq(10);
    });

    it("Should return default 10 when empty string", () => {
      expect(parseGasPriceMultiplier("")).to.eq(10);
    });

    it("Should parse valid multiplier", () => {
      expect(parseGasPriceMultiplier("5")).to.eq(5);
      expect(parseGasPriceMultiplier("1.5")).to.eq(1.5);
      expect(parseGasPriceMultiplier("1.49")).to.eq(1.49);
    });

    it("Should produce valid BigInt when multiplied by 100", () => {
      const values = ["1.49", "1.51", "2.01", "0.99", "10.1"];
      for (const v of values) {
        const m = parseGasPriceMultiplier(v);
        expect(() => BigInt(Math.round(m * 100))).to.not.throw();
      }
    });

    it("Should reject non-numeric values", () => {
      expect(() => parseGasPriceMultiplier("abc")).to.throw("GAS_PRICE_MULTIPLIER must be a positive number up to 100");
    });

    it("Should reject zero", () => {
      expect(() => parseGasPriceMultiplier("0")).to.throw("GAS_PRICE_MULTIPLIER must be a positive number up to 100");
    });

    it("Should reject negative values", () => {
      expect(() => parseGasPriceMultiplier("-5")).to.throw("GAS_PRICE_MULTIPLIER must be a positive number up to 100");
    });

    it("Should reject values above 100", () => {
      expect(() => parseGasPriceMultiplier("101")).to.throw("GAS_PRICE_MULTIPLIER must be a positive number up to 100");
    });
  });

  describe("Round utility", () => {
    it("Should round to nearest integer when decimal is 0", () => {
      expect(round(5.6)).to.eq(6);
      expect(round(5.4)).to.eq(5);
    });

    it("Should round to specified decimal places", () => {
      expect(round(5.678, 2)).to.eq(5.68);
      expect(round(5.671, 2)).to.eq(5.67);
    });
  });

  describe("ECDSA Signature", () => {
    it("Should revert if private key does not have prefix", async () => {
      const messageHash = "0x" + "a".repeat(64);
      const privateKey = "a".repeat(64);
      expect(() => ECDSASignature.signMessageHash(messageHash, privateKey)).to.throw("Invalid private key format");
    });

    it("Should revert if private key length is not correct", async () => {
      const messageHash = "0x" + "a".repeat(64);
      const privateKey = "0x" + "a".repeat(63);
      expect(() => ECDSASignature.signMessageHash(messageHash, privateKey)).to.throw("Invalid private key format");
    });

    it("Should revert if message hash is not correct", async () => {
      const messageHash = "a".repeat(64);
      const privateKey = "0x" + "a".repeat(64);
      expect(() => ECDSASignature.signMessageHash(messageHash, privateKey)).to.throw(
        `Invalid message hash format: ${messageHash}`
      );
    });
  });

  describe("Status", () => {
    it("Should clamp start epoch to 0 when current epoch is small", () => {
      const [firstRewardEpochId, lastRewardEpochId] = getEpochRange(NaN, 2);
      expect(firstRewardEpochId).to.eq(0);
      expect(lastRewardEpochId).to.eq(2);
    });

    it("Should get first and last epochs if epoch ID is not provided", async () => {
      await fsmMock.setCurrentRewardEpochId(30);
      const [firstRewardEpochId, lastRewardEpochId] = getEpochRange(NaN, 30);
      expect(firstRewardEpochId).to.eq(26);
      expect(lastRewardEpochId).to.eq(30);

      const mockAddress = await fsmMock.getAddress();
      await getStatus(web3, mockAddress, NaN);
    });

    it("Should get first and last epochs if epoch ID is provided", async () => {
      await fsmMock.setCurrentRewardEpochId(30);
      const [firstRewardEpochId, lastRewardEpochId] = getEpochRange(18, 30);
      expect(firstRewardEpochId).to.eq(18);
      expect(lastRewardEpochId).to.eq(30);

      const mockAddress = await fsmMock.getAddress();
      await fsmMock.setHashes(18, web3.utils.keccak256("hash1"), web3.utils.keccak256("hash2"));
      await getStatus(web3, mockAddress, 18);
    });
  });

  describe("Networks", () => {
    it("Should get contract address", async () => {
      expect(CONTRACTS().FlareSystemsManager.address).to.eq("0x85680Dd93755Fe5d0789773fd0896cEE51F9e358");

      process.env.NETWORK = "coston2";
      expect(CONTRACTS().FlareSystemsManager.address).to.eq("0xbC1F76CEB521Eb5484b8943B5462D08ea96617A1");

      process.env.NETWORK = "songbird";
      expect(CONTRACTS().FlareSystemsManager.address).to.eq("0x421c69E22f48e14Fc2d2Ee3812c59bfb81c38516");

      process.env.NETWORK = "flare";
      expect(CONTRACTS().FlareSystemsManager.address).to.eq("0x89e50DC0380e597ecE79c8494bAAFD84537AD0D4");

      process.env.NETWORK = "x";
      expect(() => CONTRACTS()).to.throw(`Unsupported network: ${process.env.NETWORK}`);
    });

    it("Should get RPC", async () => {
      expect(RPC()).to.eq("https://coston-api.flare.network/ext/bc/C/rpc");

      process.env.NETWORK = "coston2";
      expect(RPC()).to.eq("https://coston2-api.flare.network/ext/bc/C/rpc");

      process.env.NETWORK = "songbird";
      expect(RPC()).to.eq("https://songbird-api.flare.network/ext/bc/C/rpc");

      process.env.NETWORK = "flare";
      expect(RPC()).to.eq("https://flare-api.flare.network/ext/bc/C/rpc");

      process.env.FLARE_RPC = "private-rpc";
      expect(RPC()).to.eq("private-rpc");

      process.env.NETWORK = "x";
      expect(() => RPC()).to.throw(`Unsupported network: ${process.env.NETWORK}`);

      process.env.NETWORK = "";
      expect(() => RPC()).to.throw("NETWORK env variable is not set");
    });
  });
});
