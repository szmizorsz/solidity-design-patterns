// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MemoryArrayBuilding {
    uint[] public values;

    function addValue(uint _value) public {
        values.push(_value);
    }

    function getEvenValues() public view returns (uint[] memory) {
        uint[] memory evenValues = new uint[](values.length);
        uint counter = 0;

        for (uint i = 0; i < values.length; i++) {
            if (values[i] % 2 == 0) {
                evenValues[counter] = values[i];
                counter++;
            }
        }

        uint[] memory filteredEvenValues = new uint[](counter);
        for (uint i = 0; i < counter; i++) {
            filteredEvenValues[i] = evenValues[i];
        }

        return filteredEvenValues;
    }
}
