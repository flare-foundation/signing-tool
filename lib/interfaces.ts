export interface IRewardDistributionData {
    rewardEpochId: number;
    rewardClaims: IRewardClaimWithProof[];
    noOfWeightBasedClaims: number;
    merkleRoot: string;
    abi: any;
  }

interface IRewardClaimWithProof {
    merkleProof: string[];
    body: IRewardClaim;
}

interface IMergeableRewardClaim {
  beneficiary: string;
  amount: bigint;
  claimType: ClaimType;
}
interface IRewardClaim extends IMergeableRewardClaim {
  rewardEpochId: number;
}

enum ClaimType {
  DIRECT,
  FEE,
  WNAT,
  MIRROR,
  CCHAIN,
}