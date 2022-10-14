const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const verify = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let priceFeedAddress;

  if (developmentChains.includes(network.name)) {
    priceFeedAddress = (await deployments.get("MockV3Aggregator")).address;
  } else {
    priceFeedAddress = networkConfig[network.name].ethUsdPriceFeed;
  }

  const args = [priceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.waitConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env["ETHERSCAN_API_KEY"]
  ) {
    // Verify with etherscan
    await verify(fundMe.address, args);
  }
};
