'use client'

import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; // or import { ethers } from 'ethers';
import RentToOwnABI from './RentToOwnABI.json'; // Import the ABI of your contract
import MyNftABI from './MyNftABI.json'; // Import the ABI of your contract

// Define the NFT type
interface NFT {
    name: string;
    tokenId: string;
    contractAddress: string; // Add this property based on your NFT structure
}

const RentToOwnPage = () => {
    const [nfts, setNfts] = useState<NFT[]>([]); // Specify the type for nfts
    const [selectedNft, setSelectedNft] = useState<NFT | null>(null); // Specify the type for selectedNft
    const [monthlyPayment, setMonthlyPayment] = useState<string>('');
    const [numberOfPayments, setNumberOfPayments] = useState<string>('');
    const [account, setAccount] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>(''); // State for contract address input

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);
            }
        };

        loadBlockchainData();
    }, []);

    const loadNFTs = async (web3: Web3, account: string, contractAddress: string): Promise<NFT[]> => {
        const contract = new web3.eth.Contract(MyNftABI, contractAddress);
        
        try {
            // Get the number of NFTs owned by the account
            const balance = await contract.methods.balanceOf(account).call();
            const nfts: NFT[] = [];

            for (let i = 0; i < balance; i++) {
                // Get the token ID of the NFT owned by the account
                const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
                const tokenURI = await contract.methods.tokenURI(tokenId).call(); // Get the token URI
                const response = await fetch(tokenURI); // Fetch the metadata
                const metadata = {
                    name: `Mock NFT #${tokenId}`, // Example name
                    description: "This is a mock NFT for testing purposes.", // Example description
                    image: "https://via.placeholder.com/150", // Valid placeholder image URL
                    attributes: [
                        { trait_type: "Background", value: "Blue" },
                        { trait_type: "Rarity", value: "Common" },
                    ],
                }; //await response.json();

                nfts.push({
                    name: metadata.name,
                    tokenId: tokenId,
                    contractAddress: contractAddress, // Use the input contract address
                });
            }

            console.log('NFTs loaded:', nfts); // Log NFTs to the console
            return nfts; // Return the array of NFTs
        } catch (error) {
            console.error('Error loading NFTs:', error);
            return []; // Return an empty array on error
        }
    };

    const handleLoadNFTs = async () => {
        if (!contractAddress) {
            alert('Please enter a valid contract address.');
            return;
        }

        const web3 = new Web3(window.ethereum);
        const nfts = await loadNFTs(web3, account, contractAddress);
        setNfts(nfts);
    };

    const handleLendNFT = async () => {
        if (!selectedNft || !monthlyPayment || !numberOfPayments) return;

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(RentToOwnABI, selectedNft.contractAddress);

        try {
            await contract.methods.listNFT(
                selectedNft.contractAddress,
                selectedNft.tokenId,
                web3.utils.toWei(monthlyPayment, 'ether'),
                numberOfPayments
            ).send({ from: account });

            alert('NFT listed successfully!');
        } catch (error) {
            console.error('Error listing NFT:', error);
        }
    };

    return (
        <div>
            <h1>Rent to Own NFTs</h1>
            <div>
                <h2>Load NFTs from Contract</h2>
                <input
                    type="text"
                    placeholder="Enter NFT Contract Address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                />
                <button onClick={handleLoadNFTs}>Load NFTs</button>
            </div>
            <div>
                <h2>Your NFTs</h2>
                <ul>
                    {nfts.map((nft, index) => (
                        <li key={index}>
                            {nft.name} - {nft.tokenId}
                            <button onClick={() => setSelectedNft(nft)}>Select</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedNft && (
                <div>
                    <h2>Lend NFT</h2>
                    <p>Selected NFT: {selectedNft.name}</p>
                    <input
                        type="text"
                        placeholder="Monthly Payment (ETH)"
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Number of Payments"
                        value={numberOfPayments}
                        onChange={(e) => setNumberOfPayments(e.target.value)}
                    />
                    <button onClick={handleLendNFT}>Lend NFT</button>
                </div>
            )}
        </div>
    );
};

export default RentToOwnPage;
