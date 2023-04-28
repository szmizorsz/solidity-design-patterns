import { ethers } from "hardhat";
import { expect } from "chai";
import { Lottery } from "../../typechain-types";
import { Signer } from "ethers";

describe("Lottery Test", function () {
  let lottery: Lottery;
  let owner: Signer;
  let participant1: Signer;
  let participant2: Signer;
  let participant3: Signer;

  beforeEach(async function () {
    [owner, participant1, participant2, participant3] =
      await ethers.getSigners();

    const LotteryFactory = await ethers.getContractFactory("Lottery");
    lottery = (await LotteryFactory.deploy()) as Lottery;
    await lottery.deployed();
  });

  it("Should allow participants to enter the lottery", async function () {
    await lottery
      .connect(participant1)
      .enter({ value: ethers.utils.parseEther("1") });
    await lottery
      .connect(participant2)
      .enter({ value: ethers.utils.parseEther("1") });
    await lottery
      .connect(participant3)
      .enter({ value: ethers.utils.parseEther("1") });

    expect(await lottery.participants(0)).to.equal(
      await participant1.getAddress()
    );
    expect(await lottery.participants(1)).to.equal(
      await participant2.getAddress()
    );
    expect(await lottery.participants(2)).to.equal(
      await participant3.getAddress()
    );
  });

  it("Should pick a winner and allow them to withdraw winnings", async function () {
    await lottery
      .connect(participant1)
      .enter({ value: ethers.utils.parseEther("1") });
    await lottery
      .connect(participant2)
      .enter({ value: ethers.utils.parseEther("1") });
    await lottery
      .connect(participant3)
      .enter({ value: ethers.utils.parseEther("1") });

    // Pick a winner
    await lottery.connect(owner).pickWinner();

    // The winner should be able to withdraw their winnings
    let winnerAddress = "";
    for (const participant of [participant1, participant2, participant3]) {
      const winnings = await lottery.payments(await participant.getAddress());
      if (winnings.gt(0)) {
        winnerAddress = await participant.getAddress();
        const initialBalance = await ethers.provider.getBalance(winnerAddress);
        const withdrawTx = await lottery
          .connect(participant)
          .withdrawWinnings();
        const gasUsed = (await withdrawTx.wait()).gasUsed;
        const gasPrice = withdrawTx.gasPrice?.mul(gasUsed);
        const finalBalance = await ethers.provider.getBalance(winnerAddress);
        if (gasPrice) {
          expect(finalBalance).to.equal(
            initialBalance.add(winnings).sub(gasPrice)
          );
        }
        break;
      }
    }

    expect(winnerAddress).to.not.equal("");
  });
});
