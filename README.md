# Rent-2-Own(under development)

Taiko The Grant Factory Hackathon Project

# Rent2Own NFT Platform

Rent2Own is a decentralized platform that allows users to rent NFTs with the option to own them after fulfilling payment obligations. This innovative solution bridges the gap between renting and owning, making high-value NFTs more accessible to a broader audience.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Smart Contracts](#smart-contracts)
- [Installation](#Quickstart)
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


## 🏗 Leveraging Scaffold-ETH 2

⚙️ Using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`


## Documentation Scaffold-ETH 2

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).
