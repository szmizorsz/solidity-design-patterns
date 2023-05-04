import { ethers } from "hardhat";
import { expect } from "chai";
import { StringComparison } from "../../typechain-types";

describe("StringComparison", () => {
  let stringComparison: StringComparison;

  beforeEach(async () => {
    const StringComparisonFactory = await ethers.getContractFactory(
      "StringComparison"
    );
    stringComparison =
      (await StringComparisonFactory.deploy()) as StringComparison;
    await stringComparison.deployed();
  });

  it("should return true for equal strings", async () => {
    const result = await stringComparison.compareStrings("OpenAI", "OpenAI");
    expect(result).to.be.true;
  });

  it("should return false for non-equal strings", async () => {
    const result = await stringComparison.compareStrings("OpenAI", "GPT-4");
    expect(result).to.be.false;
  });

  it("should return true for empty strings", async () => {
    const result = await stringComparison.compareStrings("", "");
    expect(result).to.be.true;
  });

  it("should return false for an empty and a non-empty string", async () => {
    const result = await stringComparison.compareStrings("", "OpenAI");
    expect(result).to.be.false;
  });
});
