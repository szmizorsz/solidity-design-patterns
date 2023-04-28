import { ethers } from "hardhat";
import { expect } from "chai";
import { TokenSale, ERC20Mock, IERC20 } from "../../typechain-types";
import { Signer } from "ethers";

describe("TokenSale Test", function () {
  let tokenSale: TokenSale;
  let token: IERC20;
  let owner: Signer;
  let user: Signer;
  let rate: number;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy a mock ERC20 token
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = (await Token.deploy(
      "Mock Token",
      "MTK",
      ethers.utils.parseEther("1000000")
    )) as IERC20;
    await token.deployed();

    rate = 100;

    // Deploy the TokenSale contract
    const TokenSaleFactory = await ethers.getContractFactory("TokenSale");
    tokenSale = (await TokenSaleFactory.deploy(
      token.address,
      rate
    )) as TokenSale;
    await tokenSale.deployed();

    // Transfer tokens to the TokenSale contract
    await token.transfer(tokenSale.address, await token.totalSupply());
  });

  it("Should allow users to buy tokens", async function () {
    const tokensToBuy = 10;
    const cost = tokensToBuy * rate;

    await tokenSale.connect(user).buyTokens(tokensToBuy, { value: cost });

    expect(await token.balanceOf(await user.getAddress())).to.equal(
      tokensToBuy
    );
  });

  it("Should pause and unpause the contract", async function () {
    await tokenSale.connect(owner).pause();
    expect(await tokenSale.paused()).to.be.true;

    await tokenSale.connect(owner).unpause();
    expect(await tokenSale.paused()).to.be.false;
  });

  it("Should not allow buying tokens when paused", async function () {
    const tokensToBuy = 10;
    const cost = tokensToBuy * rate;

    await tokenSale.connect(owner).pause();

    await expect(
      tokenSale.connect(user).buyTokens(tokensToBuy, {
        value: ethers.utils.parseEther(cost.toString()),
      })
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Should allow owner to withdraw funds", async function () {
    const tokensToBuy = 10;
    const cost = tokensToBuy * rate;

    await tokenSale.connect(user).buyTokens(tokensToBuy, { value: cost });

    const initialOwnerBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );
    const contractBalance = await ethers.provider.getBalance(tokenSale.address);

    const tx = await tokenSale.connect(owner).withdraw();
    const txReceipt = await tx.wait();
    const gasUsed = txReceipt.gasUsed.mul(tx.gasPrice ? tx.gasPrice : 0);

    const finalOwnerBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );

    expect(finalOwnerBalance).to.equal(
      initialOwnerBalance.add(contractBalance).sub(gasUsed)
    );
  });
});
