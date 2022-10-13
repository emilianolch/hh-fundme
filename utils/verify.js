const { run } = require("hardhat");

async function verify(address, constructorArguments) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = verify;
