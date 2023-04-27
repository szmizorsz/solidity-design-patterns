import { ethers } from "hardhat";
import { expect } from "chai";
import { SecureBank, MaliciousContract } from "../../typechain-types";
import { Signer } from "ethers";

describe("SecureBank Test", function () {
  let secureBank: SecureBank;
  let maliciousContract: MaliciousContract;
  let owner: Signer;
  let attacker: Signer;
  let otherUser: Signer;

  beforeEach(async function () {
    [owner, attacker, otherUser] = await ethers.getSigners();

    const SecureBankFactory = await ethers.getContractFactory("SecureBank");
    secureBank = (await SecureBankFactory.deploy()) as SecureBank;
    await secureBank.deployed();
  });

  it("Should not be vulnerable to reentrancy attack", async function () {
    // Deposit 1 ETH from owner and otherUser
    await secureBank
      .connect(owner)
      .deposit({ value: ethers.utils.parseEther("1") });
    await secureBank
      .connect(otherUser)
      .deposit({ value: ethers.utils.parseEther("1") });

    // Check owner and otherUser balances
    expect(await secureBank.getBalance()).to.equal(
      ethers.utils.parseEther("1")
    );
    expect(await secureBank.connect(otherUser).getBalance()).to.equal(
      ethers.utils.parseEther("1")
    );

    // Deploy MaliciousContract
    const MaliciousContractFactory = await ethers.getContractFactory(
      "MaliciousContract"
    );
    maliciousContract = (await MaliciousContractFactory.deploy(
      secureBank.address
    )) as MaliciousContract;
    await maliciousContract.deployed();

    // Attacker deposits 1 ETH into MaliciousContract
    await maliciousContract
      .connect(attacker)
      .attack({ value: ethers.utils.parseEther("1") });

    // Check that MaliciousContract failed to drain SecureBank
    expect(await secureBank.connect(owner).getBalance()).to.equal(
      ethers.utils.parseEther("1")
    );
    expect(await secureBank.connect(otherUser).getBalance()).to.equal(
      ethers.utils.parseEther("1")
    );

    // Check that attacker's balance in SecureBank is 0
    expect(await secureBank.connect(attacker).getBalance()).to.equal(
      ethers.utils.parseEther("0")
    );
  });
});
