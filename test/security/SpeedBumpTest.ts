import { ethers } from "hardhat";
import { expect } from "chai";
import { SpeedBump } from "../../typechain-types";
import { Signer } from "ethers";

describe("SpeedBump", function () {
  let speedBump: SpeedBump;
  let owner: Signer;
  const WAITING_PERIOD = 86400; // 1 day in seconds

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const SpeedBumpFactory = await ethers.getContractFactory("SpeedBump");
    speedBump = (await SpeedBumpFactory.deploy()) as SpeedBump;
    await speedBump.deployed();
  });

  it("Should update pendingValue and pendingValueTimestamp when requesting value update", async function () {
    const newValue = 42;
    await speedBump.requestValueUpdate(newValue);

    expect(await speedBump.pendingValue()).to.equal(newValue);
    expect(await speedBump.pendingValueTimestamp()).to.be.closeTo(
      (await ethers.provider.getBlock("latest")).timestamp,
      2
    );
  });

  it("Should not execute value update before waiting period", async function () {
    const newValue = 42;
    await speedBump.requestValueUpdate(newValue);

    await expect(speedBump.executeValueUpdate()).to.be.revertedWith(
      "SpeedBump: Waiting period not elapsed"
    );
  });

  it("Should execute value update after waiting period", async function () {
    const newValue = 42;
    await speedBump.requestValueUpdate(newValue);

    await ethers.provider.send("evm_increaseTime", [WAITING_PERIOD]);
    await ethers.provider.send("evm_mine", []);

    await speedBump.executeValueUpdate();
    expect(await speedBump.value()).to.equal(newValue);
  });

  it("Should cancel value update", async function () {
    const newValue = 42;
    await speedBump.requestValueUpdate(newValue);

    await speedBump.cancelValueUpdate();
    expect(await speedBump.pendingValue()).to.equal(await speedBump.value());
    expect(await speedBump.pendingValueTimestamp()).to.equal(0);
  });
});
