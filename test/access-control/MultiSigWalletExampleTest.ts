import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import { expect } from "chai";
import { MultiSigWallet } from "../../typechain-types";

describe("MultiSigWallet", () => {
  let multiSigWallet: MultiSigWallet;
  let owner1: Signer;
  let owner2: Signer;
  let owner3: Signer;
  let nonOwner: Signer;
  let owners: Signer[];
  let numConfirmationsRequired = 2;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    [owner1, owner2, owner3, nonOwner] = accounts;

    const addresses = await Promise.all(
      accounts.slice(0, 3).map(async (owner) => owner.getAddress())
    );

    const MultiSigWalletFactory = await ethers.getContractFactory(
      "MultiSigWallet"
    );
    multiSigWallet = (await MultiSigWalletFactory.deploy(
      addresses,
      numConfirmationsRequired
    )) as MultiSigWallet;
    await multiSigWallet.deployed();
  });

  it("should deploy with correct numConfirmationsRequired", async () => {
    const confirmationsRequired =
      await multiSigWallet.functions.numConfirmationsRequired();
    expect(confirmationsRequired[0].toNumber()).to.equal(
      numConfirmationsRequired
    );
  });

  it("should submit transaction and emit SubmitTransaction event", async () => {
    const to = await nonOwner.getAddress();
    const value = ethers.utils.parseEther("0.5");
    const data = "0x";

    await expect(
      multiSigWallet.connect(owner1).submitTransaction(to, value, data)
    )
      .to.emit(multiSigWallet, "SubmitTransaction")
      .withArgs(await owner1.getAddress(), 0, to, value, data);
  });

  it("should confirm transaction and emit ConfirmTransaction event", async () => {
    const to = await nonOwner.getAddress();
    const value = ethers.utils.parseEther("0.5");
    const data = "0x";

    await multiSigWallet.connect(owner1).submitTransaction(to, value, data);
    await expect(multiSigWallet.connect(owner2).confirmTransaction(0))
      .to.emit(multiSigWallet, "ConfirmTransaction")
      .withArgs(await owner2.getAddress(), 0);
  });

  it("should not allow non-owners to submit, confirm, or execute transactions", async () => {
    const to = await nonOwner.getAddress();
    const value = ethers.utils.parseEther("0.5");
    const data = "0x";

    // Non-owner should not be able to submit, confirm, or execute transactions
    await expect(
      multiSigWallet.connect(nonOwner).submitTransaction(to, value, data)
    ).to.be.revertedWith("not owner");
    await multiSigWallet.connect(owner1).submitTransaction(to, value, data);
    await expect(
      multiSigWallet.connect(nonOwner).confirmTransaction(0)
    ).to.be.revertedWith("not owner");
    await multiSigWallet.connect(owner2).confirmTransaction(0);
    await expect(
      multiSigWallet.connect(nonOwner).executeTransaction(0)
    ).to.be.revertedWith("not owner");
  });

  it("should not execute transaction with insufficient confirmations", async () => {
    const to = await nonOwner.getAddress();
    const value = ethers.utils.parseEther("0.5");
    const data = "0x";

    await multiSigWallet.connect(owner1).submitTransaction(to, value, data);
    await expect(
      multiSigWallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("not enough confirmations");
  });

  it("should not allow confirming the same transaction twice by the same owner", async () => {
    const to = await nonOwner.getAddress();
    const value = ethers.utils.parseEther("0.5");
    const data = "0x";

    await multiSigWallet.connect(owner1).submitTransaction(to, value, data);
    await multiSigWallet.connect(owner1).confirmTransaction(0);
    await expect(
      multiSigWallet.connect(owner1).confirmTransaction(0)
    ).to.be.revertedWith("tx already confirmed");
  });
});
