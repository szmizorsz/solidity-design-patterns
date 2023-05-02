import { ethers } from "hardhat";
import { expect } from "chai";
import { DepositContractWithEvents } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DepositContractWithEvents", () => {
  let depositContract: DepositContractWithEvents;
  let owner: SignerWithAddress;
  let holder1: SignerWithAddress;
  let holder2: SignerWithAddress;

  beforeEach(async () => {
    [owner, holder1, holder2] = await ethers.getSigners();
    const DepositContractFactory = await ethers.getContractFactory(
      "DepositContractWithEvents"
    );
    depositContract =
      (await DepositContractFactory.deploy()) as DepositContractWithEvents;
    await depositContract.deployed();
  });

  it("Should emit DepositMade event when a new holder deposits", async () => {
    await expect(
      holder1.sendTransaction({
        to: depositContract.address,
        value: ethers.utils.parseEther("1"),
      })
    )
      .to.emit(depositContract, "DepositMade")
      .withArgs(holder1.address, ethers.utils.parseEther("1"));
  });

  it("Should not emit DepositMade event when an existing holder deposits", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });

    await expect(
      holder1.sendTransaction({
        to: depositContract.address,
        value: ethers.utils.parseEther("2"),
      })
    ).not.to.emit(depositContract, "DepositMade");
  });

  it("Should emit HolderRemoved event when removing a holder", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });

    await expect(depositContract.connect(owner).removeHolder(holder1.address))
      .to.emit(depositContract, "HolderRemoved")
      .withArgs(holder1.address);
  });

  it("Should fail if a non-owner tries to remove a holder", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });

    await expect(
      depositContract.connect(holder2).removeHolder(holder1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
