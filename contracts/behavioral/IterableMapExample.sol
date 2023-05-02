// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositContract is Ownable {
    struct Account {
        uint balance;
        uint index;
        bool exists;
    }

    mapping(address => Account) public accounts;
    address[] public holders;

    function deposit() public payable {
        require(msg.value > 0);

        if (!accounts[msg.sender].exists) {
            accounts[msg.sender] = Account({
                balance: msg.value,
                index: holders.length,
                exists: true
            });
            holders.push(msg.sender);
        } else {
            accounts[msg.sender].balance += msg.value;
        }
    }

    function getHoldersCount() public view returns (uint) {
        return holders.length;
    }

    function removeHolder(address holder) public onlyOwner {
        require(accounts[holder].exists, "Holder does not exist.");

        uint indexToRemove = accounts[holder].index;
        address lastHolder = holders[holders.length - 1];

        holders[indexToRemove] = lastHolder;
        accounts[lastHolder].index = indexToRemove;
        holders.pop();

        delete accounts[holder];
    }

    receive() external payable {
        deposit();
    }
}
