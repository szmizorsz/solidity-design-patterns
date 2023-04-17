import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { OwnableExample } from "../../typechain-types";

describe("OwnableExample", () => {
  let contract: OwnableExample;
  let owner: Signer;
  let nonOwner: Signer;

  beforeEach(async () => {
    [owner, nonOwner] = await ethers.getSigners();
    const OwnableExample = await ethers.getContractFactory("OwnableExample");
    contract = (await OwnableExample.deploy()) as OwnableExample;
  });

  describe("normalThing()", () => {
    it("should emit NormalEvent when called by anyone", async () => {
      await expect(contract.connect(owner).normalThing())
        .to.emit(contract, "NormalEvent")
        .withArgs(await owner.getAddress());

      await expect(contract.connect(nonOwner).normalThing())
        .to.emit(contract, "NormalEvent")
        .withArgs(await nonOwner.getAddress());
    });
  });

  describe("specialThing()", () => {
    it("should emit SpecialEvent when called by owner", async () => {
      await expect(contract.connect(owner).specialThing())
        .to.emit(contract, "SpecialEvent")
        .withArgs(await owner.getAddress());
    });

    it("should revert when called by non-owner", async () => {
      await expect(
        contract.connect(nonOwner).specialThing()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
