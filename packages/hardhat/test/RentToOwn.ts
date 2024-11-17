import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT, RentToOwn } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionReceipt, EventLog } from "ethers";

describe("RentToOwn", function () {
  let rentToOwn: RentToOwn;
  let rentToOwnAddress: any;
  let myNFT: MyNFT;
  let myNFTAddress: any;
  let mockToken: any;
  let lender: SignerWithAddress;
  let borrower: SignerWithAddress;
  let tokenId: any; //BigNumberish //import { BigNumberish } from "ethers";
  let monthlyPayment: any; //BigNumberish

  beforeEach(async () => {
    // Get signers
    [lender, borrower] = await ethers.getSigners();
    console.log("Lender:", lender.address);

    // Deploy NFT contract
    const MyNFTFactory = await ethers.getContractFactory("MyNFT");
    myNFT = (await MyNFTFactory.deploy(lender.address)) as MyNFT;
    await myNFT.waitForDeployment();
    myNFTAddress = await myNFT.getAddress();
    console.log("MyNFT deployed to:", await myNFT.getAddress());

    // Deploy RentToOwn contract
    const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
    rentToOwn = (await RentToOwnFactory.deploy(lender.address)) as RentToOwn;
    await rentToOwn.waitForDeployment();
    rentToOwnAddress = await rentToOwn.getAddress();
    console.log("RentToOwn deployed to:", rentToOwnAddress);

    // Setup test variables
    monthlyPayment = ethers.parseEther("0.1");

    // Mint NFT to lender with a token URI
    const tokenURI = "https://example.com/metadata/1";
    const mintTx = await myNFT.connect(lender).safeMint(lender.address as any, tokenURI as any);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const receipt = await mintTx.wait();
    tokenId = await myNFT.getCurrentTokenId();
    console.log("Token ID:", tokenId.toString());
  });

  describe("Listing NFT", function () {
    it("Should transfer NFT to contract when listed", async function () {
      await myNFT.connect(lender).approve(rentToOwnAddress, tokenId);
      await rentToOwn.connect(lender).listNFT(myNFTAddress, tokenId, monthlyPayment, 12 as any);

      expect(await myNFT.ownerOf(tokenId)).to.equal(rentToOwnAddress);
    });
  });

  describe("Starting Agreement", function () {
    beforeEach(async function () {
      await myNFT.connect(lender).approve(rentToOwnAddress, tokenId);
      await rentToOwn.connect(lender).listNFT(myNFTAddress, tokenId, monthlyPayment, 12 as any);
    });

    it("Should allow borrower to start agreement with payment", async function () {
      await rentToOwn.connect(borrower).startAgreement(0 as any, { value: monthlyPayment } as any);
      const agreement = await rentToOwn.agreements(0 as any);
      expect(agreement.borrower).to.equal(borrower.address);
    });
  });

  describe("Making Payments", function () {
    beforeEach(async function () {
      await myNFT.connect(lender).approve(rentToOwnAddress, tokenId);
      await rentToOwn.connect(lender).listNFT(myNFTAddress, tokenId, monthlyPayment, 12 as any);
      await rentToOwn.connect(borrower).startAgreement(0 as any, { value: monthlyPayment } as any);
    });

    it("Should complete agreement after all payments", async function () {
      // Make remaining 11 payments
      for (let i = 1; i < 12; i++) {
        await ethers.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]); // 25 days
        await ethers.provider.send("evm_mine", []);
        await rentToOwn.connect(borrower).makePayment(0 as any, { value: monthlyPayment } as any);
      }

      const agreement = await rentToOwn.agreements(0 as any);
      expect(agreement.isActive).to.equal(false);
      expect(await myNFT.ownerOf(tokenId)).to.equal(borrower.address);
    });

    it("Should reject late payments", async function () {
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
      await ethers.provider.send("evm_mine", []);

      await expect(
        rentToOwn.connect(borrower).makePayment(0 as any, { value: monthlyPayment } as any),
      ).to.be.revertedWith("Payment is late");
    });
  });

  describe("Airdrop functionality", function () {
    let merkleRoot: string;
    let merkleProof: string[];
    let airdropId: string;

    beforeEach(async function () {
      // Deploy mock ERC20 token for airdrop testing
      const MockERC20Factory = await ethers.getContractFactory("MockERC20");
      mockToken = await MockERC20Factory.deploy("Mock Token", "MTK");
      await mockToken.waitForDeployment();

      // Setup existing agreement like in other tests
      await myNFT.connect(lender).approve(rentToOwnAddress, tokenId);
      await rentToOwn.connect(lender).listNFT(myNFTAddress, tokenId, monthlyPayment, 12 as any);
      await rentToOwn.connect(borrower).startAgreement(0 as any, { value: monthlyPayment } as any);

      // Create merkle root and proof (simplified for testing)
      const agreementId = 0n;
      const leaf = ethers.keccak256(ethers.solidityPacked(["uint256", "address"], [agreementId, borrower.address]));
      merkleRoot = leaf;
      merkleProof = [];

      // Register airdrop
      const amount = ethers.parseEther("100");
      const duration = 86400n;
      const tx = await rentToOwn
        .connect(lender)
        .registerAirdrop(await mockToken.getAddress(), amount as any, merkleRoot as any, duration as any);

      const receipt = (await tx.wait()) as ContractTransactionReceipt;
      if (!receipt) throw new Error("No receipt available");

      const registeredEvent = receipt.logs[0] as EventLog;
      if (!registeredEvent) throw new Error("AirdropRegistered event not found");
      airdropId = registeredEvent.args[0];

      // Fund contract with airdrop tokens
      await mockToken.transfer(rentToOwnAddress, amount);
    });

    it("Should register new airdrop", async function () {
      const airdrop = await rentToOwn.airdrops(airdropId as any);
      expect(airdrop.tokenContract).to.equal(await mockToken.getAddress());
    });

    it("Should allow borrower to claim airdrop", async function () {
      const initialBalance = await mockToken.balanceOf(borrower.address);
      await rentToOwn.connect(borrower).claimAirdrop(0n as any, airdropId as any, merkleProof as any);
      const finalBalance = await mockToken.balanceOf(borrower.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent double claiming", async function () {
      await rentToOwn.connect(borrower).claimAirdrop(0n as any, airdropId as any, merkleProof as any);
      await expect(
        rentToOwn.connect(borrower).claimAirdrop(0n as any, airdropId as any, merkleProof as any),
      ).to.be.revertedWith("Airdrop already claimed");
    });

    it("Should prevent non-borrowers from claiming", async function () {
      await expect(
        rentToOwn.connect(lender).claimAirdrop(0n as any, airdropId as any, merkleProof as any),
      ).to.be.revertedWith("Not the borrower");
    });
  });
});
