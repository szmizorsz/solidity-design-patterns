// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract StructPacking {
    struct WithoutPacking {
        uint8 a;
        uint256 b;
        uint8 c;
    }

    struct WithPacking {
        uint8 a;
        uint8 c;
        uint256 b;
    }

    WithoutPacking public withoutPacking;
    WithPacking public withPacking;

    function setWithoutPacking(uint8 _a, uint256 _b, uint8 _c) public {
        withoutPacking = WithoutPacking(_a, _b, _c);
    }

    function setWithPacking(uint8 _a, uint256 _b, uint8 _c) public {
        withPacking = WithPacking(_a, _c, _b);
    }
}
