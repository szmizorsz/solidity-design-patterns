import { ethers } from "hardhat";
import { expect } from "chai";
import { SimpleAuction } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SimpleAuction", () => {
  let simpleAuction: SimpleAuction;
  let owner: SignerWithAddress;
  let bidder1: SignerWithAddress;
  let bidder2: SignerWithAddress;

  beforeEach(async () => {
    [owner, bidder1, bidder2] = await ethers.getSigners();
    const SimpleAuctionFactory = await ethers.getContractFactory(
      "SimpleAuction"
    );
    simpleAuction = (await SimpleAuctionFactory.deploy()) as SimpleAuction;
    await simpleAuction.deployed();
  });
  it("Should deploy with the correct owner", async () => {
    expect(await simpleAuction.owner()).to.equal(owner.address);
  });

  it("Should start the auction and allow bids", async () => {
    await simpleAuction.connect(owner).startAuction();

    await simpleAuction
      .connect(bidder1)
      .bid({ value: ethers.utils.parseEther("1") });

    expect(await simpleAuction.highestBidder()).to.equal(bidder1.address);
    expect(await simpleAuction.highestBid()).to.equal(
      ethers.utils.parseEther("1")
    );
  });

  it("Should not allow bids below the highest bid", async () => {
    await simpleAuction.connect(owner).startAuction();
    await simpleAuction
      .connect(bidder1)
      .bid({ value: ethers.utils.parseEther("1") });

    await expect(
      simpleAuction
        .connect(bidder2)
        .bid({ value: ethers.utils.parseEther("0.5") })
    ).to.be.revertedWith("Bid must be higher than the current highest bid.");
  });

  it("Should allow outbidding and refund the previous highest bidder", async () => {
    await simpleAuction.connect(owner).startAuction();
    await simpleAuction
      .connect(bidder1)
      .bid({ value: ethers.utils.parseEther("1") });

    const bidder1InitialBalance = await bidder1.getBalance();
    await simpleAuction
      .connect(bidder2)
      .bid({ value: ethers.utils.parseEther("2") });
    const bidder1FinalBalance = await bidder1.getBalance();

    expect(await simpleAuction.highestBidder()).to.equal(bidder2.address);
    expect(await simpleAuction.highestBid()).to.equal(
      ethers.utils.parseEther("2")
    );
    expect(bidder1FinalBalance.sub(bidder1InitialBalance)).to.equal(
      ethers.utils.parseEther("1")
    );
  });

  it("Should end the auction and transfer the highest bid to the owner", async () => {
    await simpleAuction.connect(owner).startAuction();
    await simpleAuction
      .connect(bidder1)
      .bid({ value: ethers.utils.parseEther("1") });
    await simpleAuction
      .connect(bidder2)
      .bid({ value: ethers.utils.parseEther("2") });

    const ownerInitialBalance = await owner.getBalance();
    await simpleAuction.connect(owner).endAuction();
    const ownerFinalBalance = await owner.getBalance();

    const balanceDifference = ownerFinalBalance.sub(ownerInitialBalance);
    const gasCostThreshold = ethers.utils.parseEther("0.01");

    expect(await simpleAuction.currentState()).to.equal(2); // AuctionState.Ended
    expect(balanceDifference).to.be.at.least(
      ethers.utils.parseEther("2").sub(gasCostThreshold)
    );
  });
});
