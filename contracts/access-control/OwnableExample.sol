// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableExample is Ownable {
    // Define the events
    event NormalEvent(address indexed caller);
    event SpecialEvent(address indexed caller);

    function normalThing() public {
        // anyone can call this normalThing()
        emit NormalEvent(msg.sender); // Emit NormalEvent
    }

    function specialThing() public onlyOwner {
        // only the owner can call specialThing()!
        emit SpecialEvent(msg.sender); // Emit SpecialEvent
    }
}
