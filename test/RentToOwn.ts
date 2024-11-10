import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RentToOwn, MyNFT } from "../typechain-types";

describe("RentToOwn", function () {
  let rentToOwn: RentToOwn;
  let myNFT: MyNFT;
  let lender: SignerWithAddress;
  let borrower: SignerWithAddress;
  let tokenId: number;
  let monthlyPayment: any;

  beforeEach(async function () {
    // Get signers
    [lender, borrower] = await ethers.getSigners();

    // Deploy NFT contract
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.deployed();

    // Deploy RentToOwn contract
    const RentToOwn = await ethers.getContractFactory("RentToOwn");
    rentToOwn = await RentToOwn.deploy();
    await rentToOwn.deployed();

    // Setup test variables
    monthlyPayment = ethers.utils.parseEther("0.1");

    // Mint NFT to lender
    await myNFT.connect(lender).safeMint(lender.address);
    tokenId = Number(await myNFT.getCurrentTokenId()) - 1;
  });

  describe("Listing NFT", function () {
    it("Should transfer NFT to contract when listed", async function () {
      await myNFT.connect(lender).approve(rentToOwn.address, tokenId);
      await rentToOwn.connect(lender).listNFT(
        myNFT.address,
        tokenId,
        monthlyPayment,
        12
      );

      expect(await myNFT.ownerOf(tokenId)).to.equal(rentToOwn.address);
    });
  });

  describe("Starting Agreement", function () {
    beforeEach(async function () {
      await myNFT.connect(lender).approve(rentToOwn.address, tokenId);
      await rentToOwn.connect(lender).listNFT(
        myNFT.address,
        tokenId,
        monthlyPayment,
        12
      );
    });

    it("Should allow borrower to start agreement with payment", async function () {
      await rentToOwn.connect(borrower).startAgreement(0, { value: monthlyPayment });
      const agreement = await rentToOwn.agreements(0);
      expect(agreement.borrower).to.equal(borrower.address);
    });
  });

  describe("Making Payments", function () {
    beforeEach(async function () {
      await myNFT.connect(lender).approve(rentToOwn.address, tokenId);
      await rentToOwn.connect(lender).listNFT(
        myNFT.address,
        tokenId,
        monthlyPayment,
        12
      );
      await rentToOwn.connect(borrower).startAgreement(0, { value: monthlyPayment });
    });

    it("Should complete agreement after all payments", async function () {
      // Make remaining 11 payments
      for(let i = 1; i < 12; i++) {
        await ethers.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]); // 25 days
        await ethers.provider.send("evm_mine", []);
        await rentToOwn.connect(borrower).makePayment(0, { value: monthlyPayment });
      }

      const agreement = await rentToOwn.agreements(0);
      expect(agreement.isActive).to.equal(false);
      expect(await myNFT.ownerOf(tokenId)).to.equal(borrower.address);
    });

    it("Should reject late payments", async function () {
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
      await ethers.provider.send("evm_mine", []);
      
      await expect(
        rentToOwn.connect(borrower).makePayment(0, { value: monthlyPayment })
      ).to.be.revertedWith("Payment is late");
    });
  });
});