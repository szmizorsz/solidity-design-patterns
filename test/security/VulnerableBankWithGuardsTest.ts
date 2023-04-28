import { ethers } from "hardhat";
import { expect } from "chai";
import {
  VulnerableBankWithGuard,
  MaliciousContractAgainsGuards,
} from "../../typechain-types";
import { Signer } from "ethers";

describe("VulnerableBankWithGuard Test", function () {
  let vulnerableBankWithGuard: VulnerableBankWithGuard;
  let maliciousContract: MaliciousContractAgainsGuards;
  let owner: Signer;
  let attacker: Signer;
  let otherUser: Signer;

  beforeEach(async function () {
    [owner, attacker, otherUser] = await ethers.getSigners();

    const VulnerableBankWithGuardFactory = await ethers.getContractFactory(
      "VulnerableBankWithGuard"
    );
    vulnerableBankWithGuard =
      (await VulnerableBankWithGuardFactory.deploy()) as VulnerableBankWithGuard;
    await vulnerableBankWithGuard.deployed();
  });

  it("Should not be vulnerable to reentrancy attack", async function () {
    // Deposit 1 ETH from owner and otherUser
    await vulnerableBankWithGuard
      .connect(owner)
      .deposit({ value: ethers.utils.parseEther("1") });
    await vulnerableBankWithGuard
      .connect(otherUser)
      .deposit({ value: ethers.utils.parseEther("1") });

    // Check owner and otherUser balances
    expect(await vulnerableBankWithGuard.balances(owner.getAddress())).to.equal(
      ethers.utils.parseEther("1")
    );
    expect(
      await vulnerableBankWithGuard.balances(otherUser.getAddress())
    ).to.equal(ethers.utils.parseEther("1"));

    // Deploy MaliciousContract
    const MaliciousContractFactory = await ethers.getContractFactory(
      "MaliciousContract"
    );
    maliciousContract = (await MaliciousContractFactory.deploy(
      vulnerableBankWithGuard.address
    )) as MaliciousContractAgainsGuards;
    await maliciousContract.deployed();

    // Attacker deposits 1 ETH into MaliciousContract
    await maliciousContract
      .connect(attacker)
      .attack({ value: ethers.utils.parseEther("1") });

    // Check that MaliciousContract failed to drain VulnerableBankWithGuard
    expect(await vulnerableBankWithGuard.balances(owner.getAddress())).to.equal(
      ethers.utils.parseEther("1")
    );
    expect(
      await vulnerableBankWithGuard.balances(otherUser.getAddress())
    ).to.equal(ethers.utils.parseEther("1"));

    // Check that attacker's balance in VulnerableBankWithGuard is 0
    expect(
      await vulnerableBankWithGuard.balances(attacker.getAddress())
    ).to.equal(ethers.utils.parseEther("0"));
  });
});
