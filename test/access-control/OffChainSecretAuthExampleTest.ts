import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { OffChainSecretAuth } from "../../typechain-types";

describe("OffChainSecretAuth", () => {
  let offChainSecretAuth: OffChainSecretAuth;
  let owner: Signer;
  let user: Signer;
  let nonAuthorizedUser: Signer;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    [owner, user, nonAuthorizedUser] = accounts;

    const OffChainSecretAuth = await ethers.getContractFactory(
      "OffChainSecretAuth"
    );
    offChainSecretAuth = await OffChainSecretAuth.deploy();
    await offChainSecretAuth.deployed();
  });

  it("should deploy with the correct owner", async () => {
    const contractOwner = await offChainSecretAuth.owner();
    expect(contractOwner).to.equal(await owner.getAddress());
  });

  it("should allow the owner to authorize and revoke a hash", async () => {
    const secret = "authorized secret";
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secret));

    await expect(offChainSecretAuth.connect(owner).authorizeHash(hash))
      .to.emit(offChainSecretAuth, "HashAuthorized")
      .withArgs(hash);

    const isAuthorized = await offChainSecretAuth.authorizedHashes(hash);
    expect(isAuthorized).to.be.true;

    await expect(offChainSecretAuth.connect(owner).revokeHash(hash))
      .to.emit(offChainSecretAuth, "HashRevoked")
      .withArgs(hash);

    const isRevoked = await offChainSecretAuth.authorizedHashes(hash);
    expect(isRevoked).to.be.false;
  });

  it("should allow authorized users to use secret", async () => {
    const secret = "authorized secret";
    const hash = ethers.utils.solidityKeccak256(["string"], [secret]);

    await offChainSecretAuth.connect(owner).authorizeHash(hash);

    await expect(offChainSecretAuth.connect(user).useSecret(secret))
      .to.emit(offChainSecretAuth, "SecretUsed")
      .withArgs(hash, await user.getAddress());

    const isUsed = await offChainSecretAuth.authorizedHashes(hash);
    expect(isUsed).to.be.false;
  });

  it("should not allow unauthorized users to use secret", async () => {
    const secret = "authorized secret";
    const hash = ethers.utils.solidityKeccak256(["string"], [secret]);

    await expect(
      offChainSecretAuth.connect(nonAuthorizedUser).useSecret(secret)
    ).to.be.revertedWith("Invalid secret or not authorized");
  });

  it("should not allow using the same secret twice", async () => {
    const secret = "authorized secret";
    const hash = ethers.utils.solidityKeccak256(["string"], [secret]);

    await offChainSecretAuth.connect(owner).authorizeHash(hash);
    await offChainSecretAuth.connect(user).useSecret(secret);

    await expect(
      offChainSecretAuth.connect(user).useSecret(secret)
    ).to.be.revertedWith("Invalid secret or not authorized");
  });
});
