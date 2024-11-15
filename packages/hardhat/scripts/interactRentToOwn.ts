import { ethers, network } from "hardhat";
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

  // Mint NFT to lender with a token URI
  const tokenURI = "https://example.com/metadata/1";
  const mintTx = await myNFT.connect(lender).safeMint(lender.address, tokenURI);
  await mintTx.wait();
  const tokenId: BigNumber = await myNFT.getCurrentTokenId();
  console.log("NFT minted to lender with tokenId:", tokenId.toString());

  // Setup monthly payment
  const monthlyPayment: BigNumber = ethers.utils.parseEther("0.1");
  const numberOfPayments: number = 12;

  // Lender approves RentToOwn contract
  await myNFT.connect(lender).approve(rentToOwn.address, tokenId);
  console.log("RentToOwn contract approved to transfer NFT");

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
  for (let i = 1; i < numberOfPayments; i++) {
    // Increase time by 25 days (within the 30-day payment window)
    await network.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");

    // Make payment
    await rentToOwn.connect(borrower).makePayment(0, { value: monthlyPayment });
    console.log(`Made payment ${i + 1} of ${numberOfPayments}`);

    const agreement = await rentToOwn.agreements(0);
    console.log("Agreement active:", agreement.isActive);
    console.log("Current NFT owner:", await myNFT.ownerOf(tokenId));
  }

  // Final status check
  const finalAgreement = await rentToOwn.agreements(0);
  console.log("\nFinal Status:");
  console.log("Agreement active:", finalAgreement.isActive);
  console.log("Final NFT owner:", await myNFT.ownerOf(tokenId));
  console.log("Expected owner (borrower):", borrower.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
