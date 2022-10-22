const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1"); // 1 ETH

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture();
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("should set aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("should fail if you don't send enough ETH", async function () {
      expect(fundMe.fund()).to.be.reverted;
    });

    it("should update funds data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmount(deployer);
      assert.equal(response.toString(), sendValue);
    });

    it("should add funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.funders(0);
      assert.equal(response, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a sigle funder", async function () {
      // Arrange
      const startingFoundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const txResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await txResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const fundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const deployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(fundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFoundMeBalance).toString(),
        deployerBalance.add(gasCost).toString()
      );
    });

    it("withdraw from multiple funders", async function () {
      const accounts = await ethers.getSigners();

      for (let i = 1; i < 6; i++) {
        const connectedFundMe = fundMe.connect(accounts[i]);
        await connectedFundMe.fund({ value: sendValue });
      }

      // Arrange
      const startingFoundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const txResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await txResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const fundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const deployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(fundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFoundMeBalance).toString(),
        deployerBalance.add(gasCost).toString()
      );
      expect(fundMe.funders(0)).to.be.reverted;
    });

    it("attempt to withdraw by other than owner", async function () {
      const accounts = await ethers.getSigners();
      const connectedFundMe = await fundMe.connect(accounts[1]);
      expect(connectedFundMe.withdraw()).to.be.reverted;
    });
  });
});
