// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/PullPayment.sol";

contract Lottery is PullPayment {
    address[] public participants;
    uint256 public constant TICKET_PRICE = 1 ether;

    function enter() public payable {
        require(msg.value == TICKET_PRICE, "Incorrect ticket price");
        participants.push(msg.sender);
    }

    function pickWinner() public {
        require(participants.length > 0, "No participants in the lottery");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp))) % participants.length;
        address winner = participants[randomIndex];

        // Transfer the entire balance to the winner
        uint256 winnings = address(this).balance;
        _asyncTransfer(winner, winnings);

        // Reset the participants array
        delete participants;
    }

    function withdrawWinnings() public {
        uint256 amount = payments(msg.sender);
        require(amount > 0, "No winnings to withdraw");

        // Call PullPayment's withdraw function
        withdrawPayments(payable(msg.sender));
    }
}
