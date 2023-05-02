// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleAuction {
    enum AuctionState { Created, Started, Ended }

    address payable public owner;
    AuctionState public currentState;

    uint public highestBid;
    address payable public highestBidder;

    constructor() {
        owner = payable(msg.sender);
        currentState = AuctionState.Created;
    }

    modifier inState(AuctionState _state) {
        require(currentState == _state, "Invalid state for this action.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function startAuction() public onlyOwner inState(AuctionState.Created) {
        currentState = AuctionState.Started;
    }

    function bid() public payable inState(AuctionState.Started) {
        require(msg.value > highestBid, "Bid must be higher than the current highest bid.");

        if (highestBidder != address(0)) {
            highestBidder.transfer(highestBid); // Refund previous highest bidder
        }

        highestBidder = payable(msg.sender);
        highestBid = msg.value;
    }

    function endAuction() public onlyOwner inState(AuctionState.Started) {
        currentState = AuctionState.Ended;
        owner.transfer(highestBid); // Send funds to the owner
    }
}
