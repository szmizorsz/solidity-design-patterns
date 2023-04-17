import { ethers } from "hardhat";
import { expect } from "chai";
import { AccessRestrictionWithModifiers } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AccessRestrictionWithModifiers", () => {
  let accessRestriction: AccessRestrictionWithModifiers;
  let owner: SignerWithAddress;
  let newOwner: SignerWithAddress;
  let buyer: SignerWithAddress;

  beforeEach(async () => {
    [owner, newOwner, buyer] = await ethers.getSigners();
    const AccessRestrictionFactory = await ethers.getContractFactory(
      "AccessRestrictionWithModifiers"
    );
    accessRestriction =
      (await AccessRestrictionFactory.deploy()) as AccessRestrictionWithModifiers;
    await accessRestriction.deployed();
  });

  it("should set the correct owner", async () => {
    expect(await accessRestriction.owner()).to.equal(owner.address);
  });

  it("should change owner when called by the current owner", async () => {
    await accessRestriction.connect(owner).changeOwner(newOwner.address);
    expect(await accessRestriction.owner()).to.equal(newOwner.address);
  });

  it("should not change owner when called by a non-owner", async () => {
    await expect(
      accessRestriction.connect(newOwner).changeOwner(newOwner.address)
    ).to.be.reverted;
  });

  it("should not allow buying the contract before 4 weeks", async () => {
    await expect(
      accessRestriction
        .connect(buyer)
        .buyContract({ value: ethers.utils.parseEther("1") })
    ).to.be.reverted;
  });

  it("should allow buying the contract after 4 weeks", async () => {
    // Increase time by 4 weeks
    await time.increase(2419200);

    await accessRestriction
      .connect(buyer)
      .buyContract({ value: ethers.utils.parseEther("1") });
    expect(await accessRestriction.owner()).to.equal(buyer.address);
  });

  it("should refund excess ether sent when buying the contract", async () => {
    // Increase time by 4 weeks
    await time.increase(2419200);

    const initialBalance = await buyer.getBalance();
    const tx = await accessRestriction
      .connect(buyer)
      .buyContract({ value: ethers.utils.parseEther("2") });
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(tx.gasPrice!);

    const expectedBalance = initialBalance
      .sub(ethers.utils.parseEther("1"))
      .sub(gasUsed);
    expect(await buyer.getBalance()).to.equal(expectedBalance);
  });
});
