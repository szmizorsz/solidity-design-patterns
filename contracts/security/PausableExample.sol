// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenSale is Ownable, Pausable {
    IERC20 public token;
    uint256 public rate;

    constructor(IERC20 _token, uint256 _rate) {
        token = _token;
        rate = _rate;
    }

    function buyTokens(uint256 _tokens) public payable whenNotPaused {
        require(msg.value == _tokens * rate, "Incorrect payment amount");

        token.transfer(msg.sender, _tokens);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}