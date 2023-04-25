import { ethers } from "hardhat";
import { expect } from "chai";
import { BalanceModule, LoanModule } from "../../typechain-types";
import { Signer } from "ethers";

describe("BankSystem", function () {
  let balanceModule: BalanceModule;
  let loanModule: LoanModule;
  let loanProvider: Signer;
  let users: Signer[];

  beforeEach(async function () {
    [loanProvider, ...users] = await ethers.getSigners();

    const BalanceModuleFactory = await ethers.getContractFactory(
      "BalanceModule"
    );
    balanceModule = (await BalanceModuleFactory.deploy()) as BalanceModule;
    await balanceModule.deployed();

    const LoanModuleFactory = await ethers.getContractFactory("LoanModule");
    loanModule = (await LoanModuleFactory.deploy(
      balanceModule.address,
      await loanProvider.getAddress()
    )) as LoanModule;
    await loanModule.deployed();

    // Deposit some initial funds to the loan provider's account
    await balanceModule
      .connect(loanProvider)
      .deposit({ value: ethers.utils.parseEther("10") });
  });

  it("should deposit and withdraw correctly", async () => {
    await balanceModule
      .connect(users[0])
      .deposit({ value: ethers.utils.parseEther("1") });
    expect(await balanceModule.getBalance(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("1")
    );

    await balanceModule
      .connect(users[0])
      .withdraw(ethers.utils.parseEther("0.5"));
    expect(await balanceModule.getBalance(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("0.5")
    );
  });

  it("should borrow and repay correctly", async () => {
    await balanceModule
      .connect(loanProvider)
      .deposit({ value: ethers.utils.parseEther("10") });

    await loanModule.connect(users[0]).borrow(ethers.utils.parseEther("1"));
    expect(await loanModule.getDebt(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("1")
    );
    expect(await balanceModule.getBalance(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("1")
    );

    await balanceModule
      .connect(users[0])
      .deposit({ value: ethers.utils.parseEther("1") });
    await loanModule.connect(users[0]).repay(ethers.utils.parseEther("0.5"));
    expect(await loanModule.getDebt(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("0.5")
    );
    expect(await balanceModule.getBalance(users[0].getAddress())).to.equal(
      ethers.utils.parseEther("1.5")
    );
  });
});
