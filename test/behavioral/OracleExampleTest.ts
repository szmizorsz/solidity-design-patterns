import { ethers } from "hardhat";
import { expect } from "chai";
import { Oracle } from "../../typechain-types";
import { Consumer } from "../../typechain-types";

describe("Oracle and Consumer Contracts", () => {
  let oracle: Oracle;
  let consumer: Consumer;
  let deployer: any;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const OracleFactory = await ethers.getContractFactory("Oracle");
    oracle = (await OracleFactory.deploy()) as Oracle;
    await oracle.deployed();

    const ConsumerFactory = await ethers.getContractFactory("Consumer");
    consumer = (await ConsumerFactory.deploy(oracle.address)) as Consumer;
    await consumer.deployed();
  });

  it("Should set the price in Oracle contract", async () => {
    await oracle.setPrice(500);
    const price = await oracle.getPrice();
    expect(price).to.equal(500);
  });

  it("Should retrieve the price from Oracle in Consumer contract", async () => {
    await oracle.setPrice(500);
    const price = await consumer.getExternalPrice();
    expect(price).to.equal(500);
  });
});
