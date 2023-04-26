import { ethers } from "hardhat";
import { expect } from "chai";
import {
  UserManagementDiamond,
  UsernameFacet,
  AgeFacet,
  IUsernameManagement,
  IAgeManagement,
} from "../../typechain-types";

import { Signer } from "ethers";

describe("UserManagementDiamond", function () {
  let userManagementDiamond: UserManagementDiamond;
  let usernameFacet: UsernameFacet;
  let ageFacet: AgeFacet;
  let owner: Signer;
  let addr1: Signer;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const UsernameFacetFactory = await ethers.getContractFactory(
      "UsernameFacet"
    );
    usernameFacet = (await UsernameFacetFactory.deploy()) as UsernameFacet;
    await usernameFacet.deployed();

    const AgeFacetFactory = await ethers.getContractFactory("AgeFacet");
    ageFacet = (await AgeFacetFactory.deploy()) as AgeFacet;
    await ageFacet.deployed();

    const UserManagementDiamondFactory = await ethers.getContractFactory(
      "UserManagementDiamond"
    );
    userManagementDiamond =
      (await UserManagementDiamondFactory.deploy()) as UserManagementDiamond;
    await userManagementDiamond.deployed();
    await userManagementDiamond.init();
  });

  describe("Usernames", function () {
    it("should set and get username", async function () {
      const { usernameFacet } = await getFacetInterfaces(
        userManagementDiamond,
        addr1
      );
      await usernameFacet.setUsername("Alice");
      const username = await usernameFacet.getUsername();
      expect(username).to.equal("Alice");
    });
  });

  describe("Ages", function () {
    it("should set and get age", async function () {
      const { ageFacet } = await getFacetInterfaces(
        userManagementDiamond,
        addr1
      );
      await ageFacet.setAge(30);
      const age = await ageFacet.getAge();
      expect(age).to.equal(30);
    });
  });
});

async function getFacetInterfaces(
  userManagementDiamond: UserManagementDiamond,
  signer: Signer
): Promise<{ usernameFacet: IUsernameManagement; ageFacet: IAgeManagement }> {
  const usernameFacet = (await ethers.getContractAt(
    "IUsernameManagement",
    userManagementDiamond.address,
    signer
  )) as IUsernameManagement;

  const ageFacet = (await ethers.getContractAt(
    "IAgeManagement",
    userManagementDiamond.address,
    signer
  )) as IAgeManagement;

  return { usernameFacet, ageFacet };
}
