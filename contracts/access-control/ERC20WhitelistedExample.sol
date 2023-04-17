// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Whitelist.sol";
 
contract ERC20WhitelistedExample is ERC20 {
 
   Whitelist whitelist;

   constructor(address _whitelistAddress) ERC20("ERC20WhitelistedExample", "EWLE") {
       whitelist = Whitelist(_whitelistAddress);
       _mint(msg.sender, 1000000000000000000000000);
   }
 
   function transfer(address account, uint256 amount) override public returns (bool) {
       require(whitelist.isMember(account), "Account not whitelisted.");
       address owner = _msgSender();
       super._transfer(owner, account, amount);
       return true;
   }
}