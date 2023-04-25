// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Interface to define the functions that need to be implemented by the logic contracts
interface IImplementation {
    function getValue() external view returns (uint256);
    function setValue(uint256 _value) external;
}

// ImplementationV1 is the first version of the implementation contract
contract ImplementationV1 is IImplementation {
    uint256 public value;

    function getValue() external view override returns (uint256) {
        return value;
    }

    function setValue(uint256 _value) external override {
        value = _value;
    }
}

// ImplementationV2 is the second version of the implementation contract with additional logic
contract ImplementationV2 is IImplementation {
    uint256 public value;

    function getValue() external view override returns (uint256) {
        return value * 2; // New logic: return double the value
    }

    function setValue(uint256 _value) external override {
        value = _value;
    }
}

contract Proxy {
    address public delegate;
    address public owner = msg.sender;
    uint256 public value;

    constructor(address _delegate) {
        delegate = _delegate;
    }

    function upgradeDelegate(address newDelegateAddress) public {
        require(msg.sender == owner);
        delegate = newDelegateAddress;
    }

    fallback() external payable {
        assembly {
            let _target := sload(0)
            calldatacopy(0x0, 0x0, calldatasize())
            let result := delegatecall(gas(), _target, 0x0, calldatasize(), 0x0, 0)
            returndatacopy(0x0, 0x0, returndatasize())
            switch result case 0 { revert(0, 0) } default { return (0, returndatasize()) }
        }
    }

    receive() external payable {
        // This function is intentionally left empty, as the contract only receives Ether
    }
}
