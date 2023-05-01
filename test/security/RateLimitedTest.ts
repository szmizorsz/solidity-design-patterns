import { ethers } from "hardhat";
import { expect } from "chai";
import { RateLimited } from "../../typechain-types";
import { Signer } from "ethers";

describe("RateLimited", function () {
  let rateLimited: RateLimited;
  let owner: Signer;
  const TIME_WINDOW = 60; // 1 minute
  const LIMIT = 5;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const RateLimitedFactory = await ethers.getContractFactory("RateLimited");
    rateLimited = (await RateLimitedFactory.deploy()) as RateLimited;
    await rateLimited.deployed();
  });

  it("Should allow up to the limit within the time window", async function () {
    for (let i = 0; i < LIMIT; i++) {
      await rateLimited.performAction();
    }
  });

  it("Should reject if the limit is exceeded within the time window", async function () {
    for (let i = 0; i < LIMIT; i++) {
      await rateLimited.performAction();
    }

    await expect(rateLimited.performAction()).to.be.revertedWith(
      "RateLimited: Limit reached"
    );
  });

  it("Should reset the limit after the time window", async function () {
    for (let i = 0; i < LIMIT; i++) {
      await rateLimited.performAction();
    }

    await expect(rateLimited.performAction()).to.be.revertedWith(
      "RateLimited: Limit reached"
    );

    await ethers.provider.send("evm_increaseTime", [TIME_WINDOW]);
    await ethers.provider.send("evm_mine", []);

    for (let i = 0; i < LIMIT; i++) {
      await rateLimited.performAction();
    }
  });
});
