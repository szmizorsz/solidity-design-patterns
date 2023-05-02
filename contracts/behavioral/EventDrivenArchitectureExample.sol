// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    // Event declaration
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        balances[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balances[msg.sender] >= _value, "Insufficient balance.");
        require(_to != address(0), "Invalid address.");

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        // Emitting the Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
