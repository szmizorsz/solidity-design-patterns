import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";

describe("ManagedCloneContractFactory", function () {
  let ManagedCloneContractFactory: ContractFactory;
  let managedCloneContractFactory: Contract;

  beforeEach(async () => {
    ManagedCloneContractFactory = await ethers.getContractFactory(
      "ManagedCloneContractFactory"
    );
    managedCloneContractFactory = await ManagedCloneContractFactory.deploy();
    await managedCloneContractFactory.deployed();
  });

  it("deploys a new ManagedCloneContract with the specified value", async () => {
    const initialValue = 42;
    const createTx =
      await managedCloneContractFactory.createManagedCloneContract(
        initialValue
      );
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    expect(event).to.exist;
    expect(event!.event).to.equal("ManagedCloneContractCreated");

    const managedCloneContractAddress =
      event!.args!.managedCloneContractAddress;
    const managedCloneContract = await ethers.getContractAt(
      "ManagedCloneContract",
      managedCloneContractAddress
    );

    const owner = await managedCloneContract.owner();
    const value = await managedCloneContract.value();

    expect(owner).to.equal(await ethers.provider.getSigner(0).getAddress());
    expect(value).to.equal(initialValue);
  });

  it("tracks the number of created ManagedCloneContracts", async () => {
    const countBefore =
      await managedCloneContractFactory.getManagedCloneContractsCount();
    expect(countBefore).to.equal(0);

    await managedCloneContractFactory.createManagedCloneContract(42);

    const countAfter =
      await managedCloneContractFactory.getManagedCloneContractsCount();
    expect(countAfter).to.equal(1);
  });

  it("provides a list of created ManagedCloneContracts", async () => {
    const createTx =
      await managedCloneContractFactory.createManagedCloneContract(42);
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    const managedCloneContractAddress =
      event!.args!.managedCloneContractAddress;

    const managedCloneContracts =
      await managedCloneContractFactory.getManagedCloneContracts();

    expect(managedCloneContracts.length).to.equal(1);
    expect(managedCloneContracts[0]).to.equal(managedCloneContractAddress);
  });

  it("correctly initializes the ManagedCloneContract", async () => {
    const createTx =
      await managedCloneContractFactory.createManagedCloneContract(42);
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    const managedCloneContractAddress =
      event!.args!.managedCloneContractAddress;
    const managedCloneContract = await ethers.getContractAt(
      "ManagedCloneContract",
      managedCloneContractAddress
    );

    const initialized = await managedCloneContract.initialized();
    expect(initialized).to.be.true;
  });

  it("allows calling the doSomething function on the ManagedCloneContract", async () => {
    const createTx =
      await managedCloneContractFactory.createManagedCloneContract(42);
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    const managedCloneContractAddress =
      event!.args!.managedCloneContractAddress;
    const managedCloneContract = await ethers.getContractAt(
      "ManagedCloneContract",
      managedCloneContractAddress
    );

    const result = await managedCloneContract.doSomething();
    expect(result).to.equal("This is a managed clone contract.");
  });
});
