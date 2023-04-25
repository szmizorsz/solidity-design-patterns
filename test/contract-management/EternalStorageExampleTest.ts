import { ethers } from "hardhat";
import { expect } from "chai";
import { EternalStorage, LogicContract } from "../../typechain-types";
import { Signer } from "ethers";

describe("Eternal Storage", function () {
  let eternalStorage: EternalStorage;
  let logicContract: LogicContract;
  let owner: Signer;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const EternalStorageFactory = await ethers.getContractFactory(
      "EternalStorage"
    );
    eternalStorage = (await EternalStorageFactory.deploy()) as EternalStorage;
    await eternalStorage.deployed();

    const LogicContractFactory = await ethers.getContractFactory(
      "LogicContract"
    );
    logicContract = (await LogicContractFactory.deploy(
      eternalStorage.address
    )) as LogicContract;
    await logicContract.deployed();

    // Set the latest version of the logic contract in the EternalStorage contract
    await eternalStorage.connect(owner).setLatestVersion(logicContract.address);
  });

  it("Should store and retrieve the value", async function () {
    await logicContract.setValue(42);
    const storedValue = await logicContract.getValue();
    expect(storedValue).to.equal(42);
  });

  it("Should store and retrieve the owner address", async function () {
    await logicContract.setOwner(await owner.getAddress());
    const storedOwner = await logicContract.getOwner();
    expect(storedOwner).to.equal(await owner.getAddress());
  });

  it("Should allow only the latest version to call setter functions", async function () {
    // Deploy a new version of the logic contract
    const newLogicContract = (await (
      await ethers.getContractFactory("LogicContract")
    ).deploy(eternalStorage.address)) as LogicContract;
    await newLogicContract.deployed();

    // Set the new logic contract as the latest version in the EternalStorage contract
    await eternalStorage
      .connect(owner)
      .setLatestVersion(newLogicContract.address);

    // Try to call the setValue function from the old logic contract
    await expect(logicContract.setValue(50)).to.be.revertedWith(
      "Caller is not the latest version"
    );

    // Call the setValue function from the new logic contract and check the value
    await newLogicContract.setValue(50);
    const storedValue = await newLogicContract.getValue();
    expect(storedValue).to.equal(50);
  });
});
