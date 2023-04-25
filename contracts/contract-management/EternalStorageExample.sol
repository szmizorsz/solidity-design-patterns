// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EternalStorage is Ownable {
    mapping(bytes32 => uint256) internal UIntStorage;
    mapping(bytes32 => address) internal AddressStorage;

    address public latestVersion;

    modifier onlyLatestVersion() {
        require(msg.sender == latestVersion, "Caller is not the latest version");
        _;
    }

    function getUInt(bytes32 _key) external view returns (uint256) {
        return UIntStorage[_key];
    }

    function setUInt(bytes32 _key, uint256 _value) external onlyLatestVersion {
        UIntStorage[_key] = _value;
    }

    function getAddress(bytes32 _key) external view returns (address) {
        return AddressStorage[_key];
    }

    function setAddress(bytes32 _key, address _value) external onlyLatestVersion {
        AddressStorage[_key] = _value;
    }

    function setLatestVersion(address _newVersion) external onlyOwner {
        latestVersion = _newVersion;
    }
}

pragma solidity ^0.8.18;

contract LogicContract {
    EternalStorage internal eternalStorage;

    constructor(EternalStorage _eternalStorage) {
        eternalStorage = _eternalStorage;
    }

    function getValue() public view returns (uint256) {
        return eternalStorage.getUInt(keccak256("value"));
    }

    function setValue(uint256 _value) public {
        eternalStorage.setUInt(keccak256("value"), _value);
    }

    function getOwner() public view returns (address) {
        return eternalStorage.getAddress(keccak256("owner"));
    }

    function setOwner(address _owner) public {
        eternalStorage.setAddress(keccak256("owner"), _owner);
    }
}
