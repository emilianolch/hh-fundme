const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let priceFeedAddress;

  console.log("Hello world!");

  if (developmentChains.includes(network.name)) {
    priceFeedAddress = (await deployments.get("MockV3Aggregator")).address;
  } else {
    priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const foundMe = await deploy("FoundMe", {
    from: deployer,
    args: [priceFeedAddress],
    log: true,
  });
};
