import { ethers } from "hardhat";
import { expect } from "chai";
import { Registry, UserStorage, UserLogic } from "../../typechain-types";
import { Signer } from "ethers";

describe("Registry Pattern", function () {
  let registry: Registry;
  let userStorage: UserStorage;
  let userLogic: UserLogic;
  let owner: Signer;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("Registry");
    registry = (await RegistryFactory.deploy()) as Registry;
    await registry.deployed();

    const UserStorageFactory = await ethers.getContractFactory("UserStorage");
    userStorage = (await UserStorageFactory.deploy()) as UserStorage;
    await userStorage.deployed();

    const UserLogicFactory = await ethers.getContractFactory("UserLogic");
    userLogic = (await UserLogicFactory.deploy(registry.address)) as UserLogic;
    await userLogic.deployed();

    // Register the UserStorage contract in the Registry
    await registry
      .connect(owner)
      .setContract(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UserStorage")),
        userStorage.address
      );
  });

  it("Should add and retrieve a user", async function () {
    const userAddress = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
    const userName = "Alice";

    await userLogic.addUser(userAddress, userName);
    const retrievedUserName = await userLogic.getUser(userAddress);

    expect(retrievedUserName).to.equal(userName);
  });

  it("Should allow updating the UserStorage contract", async function () {
    const newUserStorage = (await (
      await ethers.getContractFactory("UserStorage")
    ).deploy()) as UserStorage;
    await newUserStorage.deployed();

    // Update the UserStorage contract in the Registry
    await registry
      .connect(owner)
      .setContract(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UserStorage")),
        newUserStorage.address
      );

    const userAddress = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
    const userName = "Bob";

    await userLogic.addUser(userAddress, userName);
    const retrievedUserName = await userLogic.getUser(userAddress);

    expect(retrievedUserName).to.equal(userName);
  });
});
