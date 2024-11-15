import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumberish, parseEther } from "ethers";
import { ethers, network } from "hardhat";
import { MyNFT, RentToOwn } from "../typechain-types";

const deployRentToOwn: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
        On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
    
        When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
        should have sufficient balance to pay for the gas fees for contract creation.
    
        You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
        with a random private key in the .env file (then used on hardhat.config.ts)
        You can run the `yarn account` command to check your balance in every network.
      */
  // Get signers - first address will be lender, second will be borrower
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const [lender, borrower] = await ethers.getSigners();
  console.log("Lender address:", lender.address);
  console.log("Borrower address:", borrower.address);

  // Deploy MyNFT
  await deploy("MyNFT", {
    from: deployer,
    // Contract constructor arguments
    args: [lender.address],
    log: true,
    autoMine: true,
  });
  const myNFT = await hre.ethers.getContract<MyNFT>("MyNFT", deployer);
  const myNFTAddress = await myNFT.getAddress();
  console.log("MyNFT deployed to:", myNFTAddress);

  // Deploy RentToOwn
  await deploy("RentToOwn", {
    from: deployer,
    // Contract constructor arguments
    args: [lender.address],
    log: true,
    autoMine: true,
  });
  const rentToOwn = await hre.ethers.getContract<RentToOwn>("RentToOwn", deployer);
  const rentToOwnAddress = await rentToOwn.getAddress();
  console.log("RentToOwn deployed to:", rentToOwnAddress);

  // Mint NFT to lender with a token URI
  const tokenURI = "https://example.com/metadata/1";
  const mintTx = await myNFT.connect(lender).safeMint(lender.address as any, tokenURI as any);
  await mintTx.wait();
  const tokenId: BigNumberish = await myNFT.getCurrentTokenId();
  console.log("NFT minted to lender with tokenId:", tokenId.toString());

  // Setup monthly payment
  const monthlyPayment: BigNumberish = parseEther("0.1");
  const numberOfPayments: number = 12;

  // Lender approves RentToOwn contract
  await myNFT.connect(lender).approve(rentToOwnAddress as any, tokenId as any);
  console.log("RentToOwn contract approved to transfer NFT");

  // Lender lists NFT
  await rentToOwn
    .connect(lender)
    .listNFT(myNFTAddress as any, tokenId as any, monthlyPayment as any, numberOfPayments as any);
  console.log("NFT listed for rent-to-own");
  console.log("Initial NFT owner:", await myNFT.ownerOf(tokenId as any));

  // Borrower starts agreement
  await rentToOwn.connect(borrower).startAgreement(0 as any, { value: monthlyPayment } as any);
  console.log("Agreement started with first payment by borrower");
  console.log("NFT owner after agreement start:", await myNFT.ownerOf(tokenId as any));

  // Simulate 11 more monthly payments by borrower
  for (let i = 1; i < numberOfPayments; i++) {
    // Increase time by 25 days (within the 30-day payment window)
    await network.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");

    // Make payment
    await rentToOwn.connect(borrower).makePayment(0 as any, { value: monthlyPayment } as any);
    console.log(`Made payment ${i + 1} of ${numberOfPayments}`);

    const agreement = await rentToOwn.agreements(0 as any);
    console.log("Agreement active:", agreement.isActive);
    console.log("Current NFT owner:", await myNFT.ownerOf(tokenId as any));
  }

  // Final status check
  const finalAgreement = await rentToOwn.agreements(0 as any);
  console.log("\nFinal Status:");
  console.log("Agreement active:", finalAgreement.isActive);
  console.log("Final NFT owner:", await myNFT.ownerOf(tokenId as any));
  console.log("Expected owner (borrower):", borrower.address);
};

export default deployRentToOwn;

deployRentToOwn.tags = ["MyNFT", "RentToOwn"];
