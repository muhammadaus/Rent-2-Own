//todo transition to new hardhat version
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

async function main() {
   // Get signers - first address will be lender, second will be borrower
  const [lender, borrower] = await ethers.getSigners();
  console.log("Lender address:", lender.address);
  console.log("Borrower address:", borrower.address);

  // Deploy MyNFT
  const MyNFTFactory = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFTFactory.deploy();
  console.log("MyNFT deployed to:", myNFT.address);

  // Deploy RentToOwn
  const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
  const rentToOwn = await RentToOwnFactory.deploy();
  console.log("RentToOwn deployed to:", rentToOwn.address);
  
  // Mint NFT to the first Hardhat account (which is connected to your MetaMask)
  const tokenURI = "https://example.com/metadata/1";
  const [deployer] = await ethers.getSigners();
  const mintTx = await myNFT.safeMint(deployer.address, tokenURI);
  await mintTx.wait();
  const tokenId = await myNFT.getCurrentTokenId();
  console.log("NFT minted to", deployer.address, "with tokenId:", tokenId.toString());

  // Test interactions with your wallet
  console.log("\nVerifying NFT ownership...");
  const balance = await myNFT.balanceOf(deployer.address);
  console.log("Your NFT balance:", balance.toString());
  const owner = await myNFT.ownerOf(tokenId);
  console.log("Token owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
