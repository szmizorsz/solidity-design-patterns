import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";

describe("ManagedContractFactory", function () {
  let ManagedContractFactory: ContractFactory;
  let managedContractFactory: Contract;

  beforeEach(async () => {
    ManagedContractFactory = await ethers.getContractFactory(
      "ManagedContractFactory"
    );
    managedContractFactory = await ManagedContractFactory.deploy();
    await managedContractFactory.deployed();
  });

  it("deploys a new ManagedContract with the specified value", async () => {
    const initialValue = 42;
    const createTx = await managedContractFactory.createManagedContract(
      initialValue
    );
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    expect(event).to.exist;
    expect(event!.event).to.equal("ManagedContractCreated");

    const managedContractAddress = event!.args!.managedContractAddress;
    const managedContract = await ethers.getContractAt(
      "ManagedContract",
      managedContractAddress
    );

    const owner = await managedContract.owner();
    const value = await managedContract.value();

    expect(owner).to.equal(await ethers.provider.getSigner(0).getAddress());
    expect(value).to.equal(initialValue);
  });

  it("tracks the number of created ManagedContracts", async () => {
    const countBefore = await managedContractFactory.getManagedContractsCount();
    expect(countBefore).to.equal(0);

    await managedContractFactory.createManagedContract(42);

    const countAfter = await managedContractFactory.getManagedContractsCount();
    expect(countAfter).to.equal(1);
  });

  it("provides a list of created ManagedContracts", async () => {
    const createTx = await managedContractFactory.createManagedContract(42);
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    const managedContractAddress = event!.args!.managedContractAddress;

    const managedContracts = await managedContractFactory.getManagedContracts();

    expect(managedContracts.length).to.equal(1);
    expect(managedContracts[0]).to.equal(managedContractAddress);
  });

  it("allows calling the doSomething function on the ManagedContract", async () => {
    const createTx = await managedContractFactory.createManagedContract(42);
    const createReceipt = await createTx.wait();
    const event = createReceipt.events?.[0];

    const managedContractAddress = event!.args!.managedContractAddress;
    const managedContract = await ethers.getContractAt(
      "ManagedContract",
      managedContractAddress
    );

    const result = await managedContract.doSomething();
    expect(result).to.equal("This is a managed contract.");
  });
});
