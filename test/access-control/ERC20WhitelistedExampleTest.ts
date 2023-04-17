import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20WhitelistedExample, Whitelist } from "../../typechain-types";

describe("ERC20WhitelistedExample", () => {
  let whitelist: Whitelist;
  let erc20WhitelistedExample: ERC20WhitelistedExample;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const WhitelistContract = await ethers.getContractFactory("Whitelist");
    whitelist = (await WhitelistContract.deploy()) as Whitelist;
    await whitelist.deployed();

    const ERC20WhitelistedExampleContract = await ethers.getContractFactory(
      "ERC20WhitelistedExample"
    );
    erc20WhitelistedExample = (await ERC20WhitelistedExampleContract.deploy(
      whitelist.address
    )) as ERC20WhitelistedExample;
    await erc20WhitelistedExample.deployed();
  });

  describe("Transactions", () => {
    it("Should fail if sender is not whitelisted", async () => {
      await expect(
        erc20WhitelistedExample.connect(addr1).transfer(addr2.address, 50)
      ).to.be.revertedWith("Account not whitelisted.");
    });

    it("Should transfer tokens between whitelisted accounts", async () => {
      // Add addr1 to the whitelist
      await whitelist.addMember(addr1.address);

      // Owner transfers 100 tokens to addr1
      await erc20WhitelistedExample.transfer(addr1.address, 100);
      expect(await erc20WhitelistedExample.balanceOf(addr1.address)).to.equal(
        100
      );

      // Add addr2 to the whitelist
      await whitelist.addMember(addr2.address);

      // Addr1 transfers 50 tokens to addr2
      await erc20WhitelistedExample.connect(addr1).transfer(addr2.address, 50);
      expect(await erc20WhitelistedExample.balanceOf(addr1.address)).to.equal(
        50
      );
      expect(await erc20WhitelistedExample.balanceOf(addr2.address)).to.equal(
        50
      );
    });
  });
});
