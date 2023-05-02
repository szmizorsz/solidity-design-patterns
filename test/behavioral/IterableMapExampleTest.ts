import { ethers } from "hardhat";
import { expect } from "chai";
import { DepositContract } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DepositContract", () => {
  let depositContract: DepositContract;
  let owner: SignerWithAddress;
  let holder1: SignerWithAddress;
  let holder2: SignerWithAddress;
  let holder3: SignerWithAddress;

  beforeEach(async () => {
    [owner, holder1, holder2, holder3] = await ethers.getSigners();
    const DepositContractFactory = await ethers.getContractFactory(
      "DepositContract"
    );
    depositContract =
      (await DepositContractFactory.deploy()) as DepositContract;
    await depositContract.deployed();
  });

  it("Should add a holder when they deposit", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await depositContract.holders(0)).to.equal(holder1.address);
    expect(await depositContract.getHoldersCount()).to.equal(1);
  });

  it("Should update the balance of an existing holder when they deposit", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("2"),
    });

    const account = await depositContract.accounts(holder1.address);
    expect(account.balance).to.equal(ethers.utils.parseEther("3"));
    expect(account.index).to.equal(0);
    expect(account.exists).to.be.true;
  });

  it("Should remove a holder and maintain the order of remaining holders", async () => {
    await holder1.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("1"),
    });
    await holder2.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("2"),
    });
    await holder3.sendTransaction({
      to: depositContract.address,
      value: ethers.utils.parseEther("3"),
    });

    await depositContract.connect(owner).removeHolder(holder2.address);

    expect(await depositContract.getHoldersCount()).to.equal(2);
    expect(await depositContract.holders(0)).to.equal(holder1.address);
    expect(await depositContract.holders(1)).to.equal(holder3.address);

    const account = await depositContract.accounts(holder2.address);
    expect(account.balance).to.equal(0);
    expect(account.index).to.equal(0);
    expect(account.exists).to.be.false;
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
