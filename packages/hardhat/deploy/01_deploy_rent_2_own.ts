import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, Contract } from "ethers";
import {ethers, network} from "hardhat";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployRentToOwn: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("YourContract", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  console.log("👋 Initial greeting:", await yourContract.greeting());

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
};

export default deployRentToOwn;

deployRentToOwn.tags = ["RentToOwn"];
