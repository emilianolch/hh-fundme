require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("dotenv").config();

const GOERLI_RPC_URL = process.env["GOERLI_RPC_URL"];
const PRIVATE_KEY = process.env["PRIVATE_KEY"];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
  },
  networks: {
    localhost: {
      utl: "http://localhost:8545",
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: process.env["ETHERSCAN_API_KEY"],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env["COINMARKETCAP_API_KEY"],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
