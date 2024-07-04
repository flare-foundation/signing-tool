// // SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract FlareSystemsManagerMock {
    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct NumberOfWeightBasedClaims {
        uint256 rewardManagerId;
        uint256 noOfWeightBasedClaims;
    }

    mapping(uint256 rewardEpochId => mapping(address voter => bytes32))
        public voterUptimeVoteHash;

    mapping(uint256 rewardEpochId => mapping(address voter => bytes32))
        public voterRewardsHash;

    mapping(uint256 rewardEpochId => bytes32) public uptimeVoteHash;
    mapping(uint256 rewardEpochId => bytes32) public rewardsHash;

    uint256 private currentRewardEpochId;

    function signUptimeVote(
        uint24 _rewardEpochId,
        bytes32 _uptimeVoteHash,
        Signature calldata _signature
    ) external {
        bytes32 messageHash = keccak256(
            abi.encode(_rewardEpochId, _uptimeVoteHash)
        );
        address signingPolicyAddress = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(messageHash),
            _signature.v,
            _signature.r,
            _signature.s
        );
        require(voterUptimeVoteHash[_rewardEpochId][signingPolicyAddress] == bytes32(0), "already signed");
        voterUptimeVoteHash[_rewardEpochId][signingPolicyAddress] = _uptimeVoteHash;
    }

    function signRewards(
        uint24 _rewardEpochId,
        NumberOfWeightBasedClaims[] calldata _noOfWeightBasedClaims,
        bytes32 _rewardsHash,
        Signature calldata _signature
    ) external {
        bytes32 messageHash = keccak256(abi.encode(
            _rewardEpochId, keccak256(abi.encode(_noOfWeightBasedClaims)), _rewardsHash));
        address signingPolicyAddress = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(messageHash),
            _signature.v,
            _signature.r,
            _signature.s
        );
        require(voterRewardsHash[_rewardEpochId][signingPolicyAddress] == bytes32(0), "already signed");
        voterRewardsHash[_rewardEpochId][signingPolicyAddress] = _rewardsHash;
    }

    function setCurrentRewardEpochId(uint256 _rewardEpochId) external {
        currentRewardEpochId = _rewardEpochId;
    }

    function getCurrentRewardEpochId() external view returns (uint256) {
        return currentRewardEpochId;
    }

    function setHashes(uint256 _rewardEpochId, bytes32 _uptimeVoteHash, bytes32 _rewardsHash) external {
        uptimeVoteHash[_rewardEpochId] = _uptimeVoteHash;
        rewardsHash[_rewardEpochId] = _rewardsHash;
    }
}
