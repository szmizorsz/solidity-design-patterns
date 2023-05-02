// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositContractWithEvents is Ownable {
    mapping(address => uint) public balances;

    // Event declarations
    event DepositMade(address indexed holder, uint value);
    event HolderRemoved(address indexed holder);

    function deposit() public payable {
        require(msg.value > 0);

        // If holder does not exist yet, emit DepositMade event
        if (balances[msg.sender] == 0) {
            emit DepositMade(msg.sender, msg.value);
        }

        balances[msg.sender] += msg.value;
    }

    function removeHolder(address holder) public onlyOwner {
        require(balances[holder] > 0, "Holder does not exist.");

        delete balances[holder];

        // Emit HolderRemoved event
        emit HolderRemoved(holder);
    }

    receive() external payable {
        deposit();
    }
}
