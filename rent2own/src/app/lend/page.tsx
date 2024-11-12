'use client'

import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; // or import { ethers } from 'ethers';
import RentToOwnABI from './RentToOwnABI.json'; // Import the ABI of your contract

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

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                // Load NFTs from the connected wallet
                const nfts = await loadNFTs(web3, accounts[0]);
                setNfts(nfts);
            }
        };

        loadBlockchainData();
    }, []);

    const loadNFTs = async (web3: Web3, account: string): Promise<NFT[]> => { // Specify types for parameters and return type
        // Implement logic to fetch NFTs owned by the account
        // This might involve calling a specific contract or using a service like OpenSea
        return []; // Return an array of NFTs
    };

    const handleLendNFT = async () => {
        if (!selectedNft || !monthlyPayment || !numberOfPayments) return;

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(RentToOwnABI, 'YOUR_CONTRACT_ADDRESS');

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
