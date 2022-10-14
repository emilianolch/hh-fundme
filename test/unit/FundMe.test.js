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
      console.log(deployer);
      const response = await fundMe.addressToAmount(deployer);
      assert.equal(response.toString(), sendValue);
    });
  });
});
