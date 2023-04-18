// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract OffChainSecretAuth {
    address public owner;
    mapping(bytes32 => bool) public authorizedHashes;

    event HashAuthorized(bytes32 indexed hash);
    event HashRevoked(bytes32 indexed hash);
    event SecretUsed(bytes32 indexed hash, address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeHash(bytes32 hash) public onlyOwner {
        authorizedHashes[hash] = true;
        emit HashAuthorized(hash);
    }

    function revokeHash(bytes32 hash) public onlyOwner {
        authorizedHashes[hash] = false;
        emit HashRevoked(hash);
    }

    function useSecret(string memory secret) public {
        bytes32 hash = keccak256(abi.encodePacked(secret));
        require(authorizedHashes[hash], "Invalid secret or not authorized");

        // This is the restricted function the user is granted access to.
        restrictedFunction();

        // Mark the hash as used so the same secret can't be reused.
        authorizedHashes[hash] = false;
        emit SecretUsed(hash, msg.sender);
    }

    function restrictedFunction() private {
        // This is where your restricted functionality should be implemented.
    }
}
