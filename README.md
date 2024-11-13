# Rent-2-Own(under development)
Taiko The Grant Factory Hackathon Project

# Rent2Own NFT Platform

Rent2Own is a decentralized platform that allows users to rent NFTs with the option to own them after fulfilling payment obligations. This innovative solution bridges the gap between renting and owning, making high-value NFTs more accessible to a broader audience.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage](#usage)
- [Security](#security)

## Features

- **Rent-to-Own Model:** Users can rent NFTs with monthly payments, eventually owning the NFT once payments are complete.
- **Flexible Payment Plans:** Customize the number of payments and monthly amounts to suit different needs.
- **Secure Transactions:** Utilizes secure smart contracts to handle NFT transfers and payment management.
- **Ownership Transfer:** Automatically transfers NFT ownership to the borrower after all payments are made.
- **Default Handling:** Mechanisms in place to handle missed payments and return NFTs to lenders.
- **Event Logging:** Transparent tracking of agreements, payments, and ownership transfers through emitted events.

## How It Works

1. **Listing NFTs:**
   - **Lender Action:** NFT owners (lenders) can list their NFTs for rent-to-own agreements by specifying the monthly payment amount and the total number of payments required to own the NFT.
   - **Contract Interaction:** The lender transfers the NFT to the smart contract, which holds the NFT securely during the rental period.

2. **Starting an Agreement:**
   - **Borrower Action:** Interested users (borrowers) can start an agreement by paying the first monthly fee.
   - **Contract Interaction:** Upon receiving the payment, the contract records the agreement details and sets the next payment due date.

3. **Making Payments:**
   - **Borrower Action:** Borrowers make monthly payments as per the agreed schedule.
   - **Contract Interaction:** Each payment is recorded, and upon reaching the total payment amount, the contract transfers NFT ownership to the borrower.

4. **Default Handling:**
   - **Lender Action:** If a borrower misses a payment, the lender can invoke the default handling mechanism to retrieve the NFT.
   - **Contract Interaction:** The contract transfers the NFT back to the lender and handles any outstanding payments accordingly.

## Smart Contracts

### 1. RentToOwn.sol

**Purpose:** Manages the rent-to-own agreements, handling NFT listings, payments, and ownership transfers.


## Smart Contract Overview

### RentToOwn

The `RentToOwn` smart contract facilitates rental agreements for ERC721 NFTs, allowing users to eventually own the NFT by making monthly payments. Here's a breakdown of its functionalities:

- **Listing NFTs:** Lenders can list their NFTs by specifying the monthly payment and the total number of payments required for ownership.
- **Starting Agreements:** Borrowers initiate agreements by making the first payment, which assigns them as the borrower.
- **Making Payments:** Borrowers continue making monthly payments. Once all payments are made, ownership of the NFT is transferred to the borrower.
- **Handling Defaults:** If a borrower misses a payment, the lender can invoke the default mechanism to retrieve the NFT.
- **Payment Withdrawals:** Lenders can withdraw accumulated payments from the contract.

## Installation

### Prerequisites

- **Node.js:** Ensure you have Node.js (v14 or later) installed.
- **npm:** Node Package Manager comes with Node.js.

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/muhammadaus/rent-2-own.git
   cd rent-2-own
   ```

2. **Initialize npm and Install Dependencies:**

   ```bash
   npm install
   ```

   This command installs all necessary dependencies, including Hardhat and OpenZeppelin contracts.

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add your environment variables.

   ```env
   PRIVATE_KEY = your_wallet_private_key
   SEPOLIA_RPC_URL = https://rpc.hekla.taiko.xyz
   MAINNET_RPC_UR L = https://rpc.mainnet.taiko.xyz
   ```

   **Note:** Never commit your `.env` file to version control. Add it to `.gitignore`.

## Deployment

### Local Deployment (Hardhat Network)

1. **Start a Local Hardhat Node:**

   ```bash
   npx hardhat node
   ```

2. **Deploy the Contract:**

   In a new terminal window, run:

   ```bash
   npx hardhat run scripts/interactRent2Own.ts --network localhost
   ```

## Usage



### For Lenders

1. **List an NFT for Rent-to-Own:**

   - **Function:** `listNFT`
   - **Parameters:**
     - `_nftContract`: Address of the ERC721 contract.
     - `_nftId`: Token ID of the NFT.
     - `_monthlyPayment`: Amount to be paid monthly (in wei).
     - `_numberOfPayments`: Total number of payments to own the NFT.

2. **Withdraw Payments:**

   - **Function:** `withdrawPayments`
   - **Parameters:**
     - `_agreementId`: ID of the rental agreement.

### For Borrowers

1. **Start an Agreement:**

   - **Function:** `startAgreement`
   - **Parameters:**
     - `_agreementId`: ID of the rental agreement.
   - **Value:** Send the first monthly payment amount.

2. **Make a Monthly Payment:**

   - **Function:** `makePayment`
   - **Parameters:**
     - `_agreementId`: ID of the rental agreement.
   - **Value:** Send the monthly payment amount.


### Handling Defaults

- **Function:** `handleDefault`
- **Parameters:**
  - `_agreementId`: ID of the rental agreement.
- **Access:** Only the lender can invoke this function.


## Security

- **Reentrancy Guard:** Protects against reentrancy attacks using OpenZeppelin's `ReentrancyGuard`.
- **Ownership Control:** Only contract owners can perform sensitive actions using OpenZeppelin's `Ownable`.
- **Proper Payment Tracking:** Ensures payments are tracked accurately to prevent fraud.
- **NFT Ownership Transfer:** Securely handles NFT transfers to prevent unauthorized access.
