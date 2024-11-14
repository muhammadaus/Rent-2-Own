import { ethers, network } from "hardhat";

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
   
   // Mint NFT to lender with a token URI
   const tokenURI = "https://example.com/metadata/1";
   const mintTx = await myNFT.connect(lender).safeMint(lender.address, tokenURI);
   await mintTx.wait();
   const tokenId = await myNFT.getCurrentTokenId();
   console.log("NFT minted to lender with tokenId:", tokenId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});