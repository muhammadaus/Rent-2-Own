import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT, RentToOwn } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RentToOwn", function () {
  let rentToOwn: RentToOwn;
  let rentToOwnAddress: any;
  let myNFT: MyNFT;
  let myNFTAddress: any;
  let lender: SignerWithAddress;
  let borrower: SignerWithAddress;
  let tokenId: any; //BigNumberish //import { BigNumberish } from "ethers";
  let monthlyPayment: any; //BigNumberish

  before(async () => {
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
    const owner = await myNFT.ownerOf(tokenId);
    console.log("Token Owner:", owner);
    console.log(owner === lender.address ? "Lender is the owner" : "Lender is not the owner");
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
});
