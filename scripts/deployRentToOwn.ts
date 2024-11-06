import { ethers } from "hardhat";

async function main() {
  try {
    // Get the contract factory
    const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
    console.log("Deploying RentToOwn...");

    // Deploy the contract
    const rentToOwn = await RentToOwnFactory.deploy();
    await rentToOwn.deployed();

    console.log("RentToOwn deployed to:", rentToOwn.address);
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});