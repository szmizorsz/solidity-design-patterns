// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ManagedCloneContract {
    address public owner;
    uint256 public value;
    bool public initialized;

    function initialize(address _owner, uint256 _value) public {
        require(!initialized, "Already initialized");
        owner = _owner;
        value = _value;
        initialized = true;
    }

    function doSomething() public pure returns (string memory) {
        return "This is a managed clone contract.";
    }
}

pragma solidity ^0.8.18;

contract ManagedCloneContractFactory {
    event ManagedCloneContractCreated(address indexed managedCloneContractAddress, address indexed owner, uint256 value);

    address[] public managedCloneContracts;
    address public templateContract;

    constructor() {
        // Deploy the template ManagedCloneContract instance
        templateContract = address(new ManagedCloneContract());
    }

    function createManagedCloneContract(uint256 _value) public returns (address) {
        // Deploy the minimal proxy using EIP-1167 standard
        address clone = createClone(templateContract);

        // Initialize the state of the proxy contract
        ManagedCloneContract(clone).initialize(msg.sender, _value);

        // Store the address of the newly created ManagedCloneContract
        managedCloneContracts.push(clone);

        emit ManagedCloneContractCreated(clone, msg.sender, _value);

        return clone;
    }

    function getManagedCloneContractsCount() public view returns (uint256) {
        return managedCloneContracts.length;
    }

    function getManagedCloneContracts() public view returns (address[] memory) {
        return managedCloneContracts;
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(clone, 0x14), targetBytes)
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            result := create(0, clone, 0x37)
        }
    }
}
