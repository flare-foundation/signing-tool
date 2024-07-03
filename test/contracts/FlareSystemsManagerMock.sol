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
        public uptimeVoteHash;

    mapping(uint256 rewardEpochId => mapping(address voter => bytes32))
        public rewardsHash;

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
        require(uptimeVoteHash[_rewardEpochId][signingPolicyAddress] == bytes32(0), "already signed");
        uptimeVoteHash[_rewardEpochId][signingPolicyAddress] = _uptimeVoteHash;
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
        require(rewardsHash[_rewardEpochId][signingPolicyAddress] == bytes32(0), "already signed");
        rewardsHash[_rewardEpochId][signingPolicyAddress] = _rewardsHash;
    }
}
