import { ethers } from "hardhat";
import { expect } from "chai";
import { SimpleToken } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SimpleToken", () => {
  let simpleToken: SimpleToken;
  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, receiver, other] = await ethers.getSigners();
    const SimpleTokenFactory = await ethers.getContractFactory("SimpleToken");
    simpleToken = (await SimpleTokenFactory.deploy(
      ethers.utils.parseEther("1000")
    )) as SimpleToken;
    await simpleToken.deployed();
  });

  it("Should assign total supply to the owner", async () => {
    const ownerBalance = await simpleToken.balances(owner.address);
    expect(await simpleToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens from owner to the receiver", async () => {
    const transferAmount = ethers.utils.parseEther("100");

    const transferTx = await simpleToken.transfer(
      receiver.address,
      transferAmount
    );
    await transferTx.wait(); // Wait for the transaction to be mined

    expect(await simpleToken.balances(receiver.address)).to.equal(
      transferAmount
    );
    expect(await simpleToken.balances(owner.address)).to.equal(
      ethers.utils.parseEther("900")
    );
  });

  it("Should emit Transfer event on token transfer", async () => {
    const transferAmount = ethers.utils.parseEther("50");

    const transferTx = await simpleToken.transfer(
      receiver.address,
      transferAmount
    );
    const receipt = await transferTx.wait(); // Wait for the transaction to be mined

    expect(receipt.events).to.satisfy((events: any[]) =>
      events.some(
        (event) =>
          event.event === "Transfer" &&
          event.args.from === owner.address &&
          event.args.to === receiver.address &&
          event.args.value.eq(transferAmount)
      )
    );
  });

  it("Should fail if sender has insufficient balance", async () => {
    const senderInitialBalance = await simpleToken.balances(other.address);
    const transferAmount = ethers.utils.parseEther("1");

    await expect(
      simpleToken.connect(other).transfer(receiver.address, transferAmount)
    ).to.be.revertedWith("Insufficient balance.");

    expect(await simpleToken.balances(receiver.address)).to.equal(0);
    expect(await simpleToken.balances(other.address)).to.equal(
      senderInitialBalance
    );
  });

  it("Should fail if the recipient address is a zero address", async () => {
    const transferAmount = ethers.utils.parseEther("10");

    await expect(
      simpleToken.transfer(ethers.constants.AddressZero, transferAmount)
    ).to.be.revertedWith("Invalid address.");
  });
});
