// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SecureBank {
    mapping(address => uint256) private balances;

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        // Checks: Ensure that the user has enough balance to withdraw the requested amount
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Effects: Update the user's balance
        balances[msg.sender] -= amount;

        // Interactions: Transfer the requested amount to the user
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
