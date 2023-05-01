// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract RateLimited {
    uint256 private constant TIME_WINDOW = 1 minutes;
    uint256 private constant LIMIT = 5;
    uint256 private counter = 0;
    uint256 private lastCallTimestamp = 0;

    modifier rateLimited() {
        if (block.timestamp >= lastCallTimestamp + TIME_WINDOW) {
            // Time window elapsed, reset counter and lastCallTimestamp
            counter = 0;
            lastCallTimestamp = block.timestamp;
        }

        require(counter < LIMIT, "RateLimited: Limit reached");
        _;
        counter++;
    }

    function performAction() public rateLimited {
        // Your logic here
    }
}
