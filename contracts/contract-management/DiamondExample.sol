// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Diamond Cutter interface
interface IDiamondCut {
    enum FacetCutAction {Add, Replace, Remove}
    struct FacetAddressAndFunctionSelectors {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }
    function diamondCut(FacetAddressAndFunctionSelectors[] memory _diamondCut) external;
    event DiamondCut(FacetAddressAndFunctionSelectors[] _diamondCut, address _init, bytes _calldata);
}

// Diamond Loupe interface
interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }
    function facets() external view returns (Facet[] memory);
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory);
    function facetAddresses() external view returns (address[] memory);
    function facetAddress(bytes4 _functionSelector) external view returns (address);
}

// User Management interfaces
interface IUsernameManagement {
    function setUsername(string calldata _username) external;
    function getUsername() external view returns (string memory);
}

interface IAgeManagement {
    function setAge(uint256 _age) external;
    function getAge() external view returns (uint256);
}

contract UsernameFacet is IUsernameManagement {
    mapping(address => string) private _usernames;

    function setUsername(string calldata _username) external override {
        _usernames[msg.sender] = _username;
    }

    function getUsername() external view override returns (string memory) {
        return _usernames[msg.sender];
    }
}

contract AgeFacet is IAgeManagement {
    mapping(address => uint256) private _ages;

    function setAge(uint256 _age) external override {
        _ages[msg.sender] = _age;
    }

    function getAge() external view override returns (uint256) {
        return _ages[msg.sender];
    }
}

contract UserManagementDiamond is IDiamondCut, IDiamondLoupe {
    // Mapping to store function selectors to facet addresses
    mapping(bytes4 => address) public selectorToFacetAddress;

    // Function to initialize the contract with the initial facets and their function selectors
    function init() external {
        // Check if contract has already been initialized
        require(
            selectorToFacetAddress[bytes4(keccak256("setUsername(string)"))] ==
                address(0),
            "Contract has already been initialized"
        );

        // Create instances of the facets
        UsernameFacet usernameFacet = new UsernameFacet();
        AgeFacet ageFacet = new AgeFacet();

        // Add the facets and their function selectors
        bytes4[] memory usernameFunctionSelectors = new bytes4[](2);
        usernameFunctionSelectors[0] = bytes4(keccak256("setUsername(string)"));
        usernameFunctionSelectors[1] = bytes4(keccak256("getUsername()"));
        bytes4[] memory ageFunctionSelectors = new bytes4[](2);
        ageFunctionSelectors[0] = bytes4(keccak256("setAge(uint256)"));
        ageFunctionSelectors[1] = bytes4(keccak256("getAge()"));

        FacetAddressAndFunctionSelectors[] memory cut =
            new FacetAddressAndFunctionSelectors[](2);
        cut[0] = FacetAddressAndFunctionSelectors({
            facetAddress: address(usernameFacet),
            action: FacetCutAction.Add,
            functionSelectors: usernameFunctionSelectors
        });
        cut[1] = FacetAddressAndFunctionSelectors({
            facetAddress: address(ageFacet),
            action: FacetCutAction.Add,
            functionSelectors: ageFunctionSelectors
        });

        diamondCut(cut);
    }

    function diamondCut(
        FacetAddressAndFunctionSelectors[] memory _diamondCut
    ) public {
        for (uint256 i = 0; i < _diamondCut.length; i++) {
            FacetAddressAndFunctionSelectors memory cut = _diamondCut[i];
            if (
                cut.action == FacetCutAction.Add ||
                cut.action == FacetCutAction.Replace
            ) {
                for (uint256 j = 0; j < cut.functionSelectors.length; j++) {
                    bytes4 selector = cut.functionSelectors[j];
                    selectorToFacetAddress[selector] = cut.facetAddress;
                }
            } else if (cut.action == FacetCutAction.Remove) {
                for (uint256 j = 0; j < cut.functionSelectors.length; j++) {
                    bytes4 selector = cut.functionSelectors[j];
                    delete selectorToFacetAddress[selector];
                }
            }
        }
        emit DiamondCut(_diamondCut, msg.sender, msg.data);
    }

    // Fallback function to delegate calls to the appropriate facet
    fallback() external payable {
        address facet = selectorToFacetAddress[msg.sig];
        require(facet != address(0), "Function does not exist");
        (bool success, bytes memory result) = facet.delegatecall(msg.data);
        if (success) {
            assembly {
                return(add(result, 0x20), mload(result))
            }
        } else {
            if (result.length > 0) {
                assembly {
                    let resultDataSize := mload(result)
                    revert(add(result, 32), resultDataSize)
                }
            } else {
                revert("Facet call failed");
            }
        }
    }

    receive() external payable {
        // This function is intentionally left empty, as the contract only receives Ether
    }

    // ... Rest of the implementation for diamond loupe functions without the real implementation
    function facets() external view override returns (Facet[] memory) {}

    function facetFunctionSelectors(
        address _facet
    ) external view override returns (bytes4[] memory) {}

    function facetAddresses()
        external
        view
        override
        returns (address[] memory)
    {}

    function facetAddress(
        bytes4 _functionSelector
    ) external view override returns (address) {}
}
