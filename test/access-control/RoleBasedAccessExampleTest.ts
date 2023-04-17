import { ethers } from "hardhat";
import { expect } from "chai";
import { RoleBasedAccessExample } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("RoleBasedAccessExample", () => {
  let myToken: RoleBasedAccessExample;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let receiver: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, minter, receiver, other] = await ethers.getSigners();
    const RoleBasedAccessExample = await ethers.getContractFactory(
      "RoleBasedAccessExample"
    );
    myToken = (await RoleBasedAccessExample.deploy(
      minter.address
    )) as RoleBasedAccessExample;
    await myToken.deployed();
  });

  it("should assign the MINTER_ROLE to the specified account", async () => {
    expect(await myToken.hasRole(myToken.MINTER_ROLE(), minter.address)).to.be
      .true;
  });

  it("should not assign the MINTER_ROLE to other accounts", async () => {
    expect(await myToken.hasRole(myToken.MINTER_ROLE(), owner.address)).to.be
      .false;
    expect(await myToken.hasRole(myToken.MINTER_ROLE(), other.address)).to.be
      .false;
  });

  it("should mint tokens to the specified account", async () => {
    const amount = ethers.utils.parseUnits("1000", 18);
    await myToken.connect(minter).mint(receiver.address, amount);
    expect(await myToken.balanceOf(receiver.address)).to.equal(amount);
  });

  it("should not mint tokens if the caller is not a minter", async () => {
    const amount = ethers.utils.parseUnits("1000", 18);
    await expect(
      myToken.connect(other).mint(receiver.address, amount)
    ).to.be.revertedWith("Caller is not a minter");
  });
});
