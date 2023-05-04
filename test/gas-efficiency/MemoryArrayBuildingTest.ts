import { ethers } from "hardhat";
import { expect } from "chai";
import { MemoryArrayBuilding } from "../../typechain-types";

describe("MemoryArrayBuilding", () => {
  let memoryArrayBuilding: MemoryArrayBuilding;

  beforeEach(async () => {
    const MemoryArrayBuildingFactory = await ethers.getContractFactory(
      "MemoryArrayBuilding"
    );
    memoryArrayBuilding =
      (await MemoryArrayBuildingFactory.deploy()) as MemoryArrayBuilding;
    await memoryArrayBuilding.deployed();
  });

  it("should add values correctly", async () => {
    await memoryArrayBuilding.addValue(1);
    await memoryArrayBuilding.addValue(2);
    await memoryArrayBuilding.addValue(3);

    expect(await memoryArrayBuilding.values(0)).to.equal(1);
    expect(await memoryArrayBuilding.values(1)).to.equal(2);
    expect(await memoryArrayBuilding.values(2)).to.equal(3);
  });

  it("should return even values correctly", async () => {
    await memoryArrayBuilding.addValue(1);
    await memoryArrayBuilding.addValue(2);
    await memoryArrayBuilding.addValue(3);
    await memoryArrayBuilding.addValue(4);
    await memoryArrayBuilding.addValue(5);
    await memoryArrayBuilding.addValue(6);

    const evenValuesBigNumber = await memoryArrayBuilding.getEvenValues();
    const evenValues = evenValuesBigNumber.map((value) => value.toNumber());
    expect(evenValues).to.have.length(3);
    expect(evenValues).to.eql([2, 4, 6]);
  });

  it("should return an empty array if there are no even values", async () => {
    await memoryArrayBuilding.addValue(1);
    await memoryArrayBuilding.addValue(3);
    await memoryArrayBuilding.addValue(5);

    const evenValues = await memoryArrayBuilding.getEvenValues();
    expect(evenValues).to.have.length(0);
    expect(evenValues).to.eql([]);
  });
});
