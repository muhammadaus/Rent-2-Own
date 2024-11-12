import { ethers, network } from "hardhat";

async function main() {
  // Get signers - first address will be lender, second will be borrower
  const [lender, borrower] = await ethers.getSigners();
  console.log("Lender address:", lender.address);
  console.log("Borrower address:", borrower.address);

  // Deploy MyNFT
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.deployed();
  console.log("MyNFT deployed to:", myNFT.address);

  // Deploy RentToOwn
  const RentToOwn = await ethers.getContractFactory("RentToOwn");
  const rentToOwn = await RentToOwn.deploy();
  await rentToOwn.deployed();
  console.log("RentToOwn deployed to:", rentToOwn.address);
  
  // Mint NFT to lender with a token URI
  const tokenURI = "https://example.com/metadata/1"; // Replace with actual metadata URI
  await myNFT.connect(lender).safeMint(lender.address, tokenURI);
  const tokenId = Number(await myNFT.getCurrentTokenId()) - 1; // Get the last minted token ID
  console.log("NFT minted to lender at:", lender.address, "with tokenId:", tokenId.toString());

  // Lender approves RentToOwn contract
  await myNFT.connect(lender).approve(rentToOwn.address, tokenId);
  console.log("RentToOwn contract approved to transfer NFT");

  const monthlyPayment = ethers.utils.parseEther("0.1");
  const numberOfPayments = 12;

  // Lender lists NFT
  await rentToOwn.connect(lender).listNFT(
    myNFT.address,
    tokenId,
    monthlyPayment,
    numberOfPayments
  );
  console.log("NFT listed for rent-to-own");
  console.log("Initial NFT owner:", await myNFT.ownerOf(tokenId));

  // Borrower starts agreement
  await rentToOwn.connect(borrower).startAgreement(0, { value: monthlyPayment });
  console.log("Agreement started with first payment by borrower");
  console.log("NFT owner after agreement start:", await myNFT.ownerOf(tokenId));

  // Simulate 11 more monthly payments by borrower
  for (let i = 1; i < 12; i++) {
    await rentToOwn.connect(borrower).makePayment(0, { value: monthlyPayment });
    console.log(`Made payment ${i + 1} of 12 by borrower`);
    
    await network.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]); // Increase time by 25 days
    await network.provider.send("evm_mine"); // Mine a new block

    const isActive = (await rentToOwn.agreements(0)).isActive;
    console.log("Agreement active:", isActive);
    console.log("Current NFT owner:", await myNFT.ownerOf(tokenId));
  }

  await network.provider.send("evm_increaseTime", [50 * 24 * 60 * 60]); // Increase time by 50 days
  await network.provider.send("evm_mine"); // Mine a new block

  // Check final status
  console.log("Final NFT owner:", await myNFT.ownerOf(tokenId));
  const isActive = (await rentToOwn.agreements(0)).isActive;
  console.log("Agreement active:", isActive);
  console.log("Remaining balance:", (await rentToOwn.getRemainingBalance(0)).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});