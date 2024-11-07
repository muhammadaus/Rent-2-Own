import { ethers } from "hardhat";

async function main() {
  const MyNFTFactory = await ethers.getContractFactory("MyNFT");
  console.log("Deploying MyNFT...");

  const myNFT = await MyNFTFactory.deploy();
  await myNFT.deployed();

  console.log("MyNFT deployed to:", myNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});