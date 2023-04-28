// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ReentrancyGuard {
    uint256 private constant UNLOCKED = 1;
    uint256 private constant LOCKED = 2;

    uint256 private _status;

    constructor() {
        _status = UNLOCKED;
    }

    modifier nonReentrant() {
        require(_status != LOCKED, "ReentrancyGuard: reentrant call");
        _status = LOCKED;
        _;
        _status = UNLOCKED;
    }
}
