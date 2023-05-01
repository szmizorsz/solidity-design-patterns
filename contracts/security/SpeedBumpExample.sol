// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SpeedBump {
    uint256 private constant WAITING_PERIOD = 1 days;
    uint256 public value;
    uint256 public pendingValue;
    uint256 public pendingValueTimestamp;

    function requestValueUpdate(uint256 newValue) public {
        pendingValue = newValue;
        pendingValueTimestamp = block.timestamp;
    }

    function executeValueUpdate() public {
        require(block.timestamp >= pendingValueTimestamp + WAITING_PERIOD, "SpeedBump: Waiting period not elapsed");
        value = pendingValue;
    }

    function cancelValueUpdate() public {
        pendingValue = value;
        pendingValueTimestamp = 0;
    }
}
