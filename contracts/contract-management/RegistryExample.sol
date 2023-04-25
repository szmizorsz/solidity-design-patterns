// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Registry {
    mapping(bytes32 => address) public contracts;

    function getContract(bytes32 _key) external view returns (address) {
        return contracts[_key];
    }

    function setContract(bytes32 _key, address _contractAddress) external {
        contracts[_key] = _contractAddress;
    }
}

pragma solidity ^0.8.18;

contract UserStorage {
    mapping(address => string) private users;

    function addUser(address _userAddress, string memory _userName) external {
        users[_userAddress] = _userName;
    }

    function getUser(address _userAddress) external view returns (string memory) {
        return users[_userAddress];
    }
}

pragma solidity ^0.8.18;

contract UserLogic {
    Registry private registry;

    constructor(Registry _registry) {
        registry = _registry;
    }

    function addUser(address _userAddress, string memory _userName) external {
        UserStorage userStorage = UserStorage(registry.getContract(keccak256("UserStorage")));
        userStorage.addUser(_userAddress, _userName);
    }

    function getUser(address _userAddress) external view returns (string memory) {
        UserStorage userStorage = UserStorage(registry.getContract(keccak256("UserStorage")));
        return userStorage.getUser(_userAddress);
    }
}

