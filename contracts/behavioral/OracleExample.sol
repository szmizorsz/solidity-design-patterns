// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Oracle {
    uint256 private price;

    function setPrice(uint256 _price) external {
        price = _price;
    }

    function getPrice() external view returns (uint256) {
        return price;
    }
}

contract Consumer {
    Oracle private oracleInstance;

    constructor(address oracleAddress) {
        oracleInstance = Oracle(oracleAddress);
    }

    function getExternalPrice() public view returns (uint256) {
        return oracleInstance.getPrice();
    }
}
