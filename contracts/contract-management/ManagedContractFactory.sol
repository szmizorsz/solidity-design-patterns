// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// The contract to be deployed by the factory
contract ManagedContract {
    address public owner;
    uint256 public value;

    constructor(address _owner, uint256 _value) {
        owner = _owner;
        value = _value;
    }

    function doSomething() public pure returns (string memory) {
        return "This is a managed contract.";
    }
}

// The factory contract
contract ManagedContractFactory {
    event ManagedContractCreated(address indexed managedContractAddress, address indexed owner, uint256 value);
    
    // Array to store the addresses of the deployed ManagedContracts
    address[] public managedContracts;

    // Deploy a new ManagedContract and return its address
    function createManagedContract(uint256 _value) public returns (address) {
        ManagedContract managedContract = new ManagedContract(msg.sender, _value);
        emit ManagedContractCreated(address(managedContract), msg.sender, _value);

        // Store the address of the newly created ManagedContract
        managedContracts.push(address(managedContract));

        return address(managedContract);
    }

    // Get the number of deployed ManagedContracts
    function getManagedContractsCount() public view returns (uint256) {
        return managedContracts.length;
    }

    // Get the deployed ManagedContracts' addresses
    function getManagedContracts() public view returns (address[] memory) {
        return managedContracts;
    }
}